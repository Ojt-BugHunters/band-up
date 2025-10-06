package com.project.Band_Up.services.AwsService;

import com.project.Band_Up.dtos.media.UploadInfo;

import java.time.Duration;
import java.util.UUID;

public interface S3Service {
    public UploadInfo createUploadPresignedUrl(String key, String contentType);
    public String createCloudFrontSignedUrl(String key, Duration expiration);
    public boolean exists(String key);
    void deleteObject(String key);
}
