package com.project.Band_Up.services.AwsService;

import com.amazonaws.services.cloudfront.CloudFrontUrlSigner;
import com.project.Band_Up.dtos.media.UploadInfo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.exception.SdkClientException;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;

@Slf4j
@Service
public class S3ServiceImpl implements S3Service {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final String bucket;
    private final String cloudFrontDomain;
    private final String cloudFrontKeyPairId;
    private final PrivateKey cloudFrontPrivateKey;

    @Value("${aws.s3.presign.ttl-seconds:600}")
    private long presignTtlSeconds;
    @Value("${aws.cloudfront.ttl-seconds:86400}")
    private long cloudFrontTtlSeconds;

    public S3ServiceImpl(S3Client s3Client,
                         S3Presigner s3Presigner,
                         @Value("${aws.s3.bucket}") String bucket,
                         @Value("${cloudfront.domain}") String cloudFrontDomain,
                         @Value("${cloudfront.keypair.id}") String cloudFrontKeyPairId,
                         @Value("${cloudfront.private.key.path}") String cloudFrontPrivateKeyPath
    ) {
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
        this.bucket = bucket;
        this.cloudFrontDomain = cloudFrontDomain;
        this.cloudFrontKeyPairId = cloudFrontKeyPairId;
        try {
            String pemContent = Files.readString(Paths.get(cloudFrontPrivateKeyPath));
            this.cloudFrontPrivateKey = parsePrivateKeyPem(pemContent);
            log.info("[CloudFront] Loaded private key from file: {}", cloudFrontPrivateKeyPath);
        } catch (Exception e) {
            log.error("[CloudFront] Failed to load private key from path: {}", cloudFrontPrivateKeyPath, e);
            throw new RuntimeException("Could not read CloudFront private key file", e);
        }

    }

    @Override
    public UploadInfo createUploadPresignedUrl(String key, String contentType) {
        try {
            Duration ttl = Duration.ofSeconds(presignTtlSeconds);

            PutObjectRequest por = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(contentType)
                    .build();

            PutObjectPresignRequest presignReq = PutObjectPresignRequest.builder()
                    .putObjectRequest(por)
                    .signatureDuration(ttl)
                    .build();

            URL url = s3Presigner.presignPutObject(presignReq).url();
            Instant expiresAt = Instant.now().plus(ttl);

            log.info("[S3] Generated presigned upload URL for key={} (expires at {})", key, expiresAt);

            return new UploadInfo(key, url.toString(), expiresAt);
        } catch (S3Exception e) {
            log.error("[S3] Failed to generate presigned URL for key={} — AWS returned error: {}", key, e.awsErrorDetails().errorMessage(), e);
            throw e;
        } catch (SdkClientException e) {
            log.error("[S3] SDK client error while generating presigned URL for key={}: {}", key, e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("[S3] Unexpected error generating presigned URL for key={}: {}", key, e.getMessage(), e);
            throw new RuntimeException("Failed to generate presigned URL", e);
        }
    }

    @Override
    public String createCloudFrontSignedUrl(String key) {
        try {
            Duration ttlCf = Duration.ofSeconds(cloudFrontTtlSeconds);
            String resource = String.format("https://%s/%s", cloudFrontDomain, key);
            long expiresEpoch = (System.currentTimeMillis() / 1000L) + ttlCf.getSeconds();
            Date expires = new Date(expiresEpoch * 1000L);

            String signedUrl = CloudFrontUrlSigner.getSignedURLWithCannedPolicy(
                    resource,
                    cloudFrontKeyPairId,
                    cloudFrontPrivateKey,
                    expires
            );

            log.info("[CloudFront] Signed URL generated for resource={} (expires at {})", resource, expires);
            return signedUrl;
        } catch (Exception e) {
            log.error("[CloudFront] Failed to sign URL for key={}: {}", key, e.getMessage(), e);
            throw new RuntimeException("Fail to sign CloudFront URL", e);
        }
    }

    @Override
    public boolean exists(String key) {
        try {
            s3Client.headObject(HeadObjectRequest.builder().bucket(bucket).key(key).build());
            log.debug("[S3] Object exists: key={}", key);
            return true;
        } catch (NoSuchKeyException e) {
            log.info("[S3] Object not found: key={}", key);
            return false;
        } catch (S3Exception e) {
            log.error("[S3] Error checking existence of key={} — {}", key, e.awsErrorDetails().errorMessage(), e);
            return false;
        } catch (Exception e) {
            log.error("[S3] Unexpected error checking existence of key={}: {}", key, e.getMessage(), e);
            return false;
        }
    }

    @Override
    public void deleteObject(String key) {
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(key).build());
            log.info("[S3] Deleted object successfully: key={}", key);
        } catch (NoSuchKeyException e) {
            log.warn("[S3] Attempted to delete non-existing object: key={}", key);
        } catch (S3Exception e) {
            log.error("[S3] Failed to delete object key={} — {}", key, e.awsErrorDetails().errorMessage(), e);
        } catch (Exception e) {
            log.error("[S3] Unexpected error deleting object key={}: {}", key, e.getMessage(), e);
        }
    }

    // helper parse PEM PKCS#8
    private PrivateKey parsePrivateKeyPem(String pem) {
        try {
            String normalized = pem
                    .replace("-----BEGIN PRIVATE KEY-----", "")
                    .replace("-----END PRIVATE KEY-----", "")
                    .replaceAll("\\s+", "");
            byte[] decoded = Base64.getDecoder().decode(normalized);
            PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(decoded);
            KeyFactory kf = KeyFactory.getInstance("RSA");
            log.debug("[CloudFront] Private key parsed successfully");
            return kf.generatePrivate(spec);
        } catch (Exception e) {
            log.error("[CloudFront] Invalid private key PEM: {}", e.getMessage(), e);
            throw new RuntimeException("Invalid CloudFront private key PEM", e);
        }
    }
}
