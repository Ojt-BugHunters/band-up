package com.project.Band_Up.services.profile;

import com.project.Band_Up.dtos.profile.AvatarDto;
import com.project.Band_Up.dtos.profile.ProfileDto;
import com.project.Band_Up.entities.Account;
import com.project.Band_Up.exceptions.ResourceNotFoundException;
import com.project.Band_Up.repositories.AccountRepository;
import com.project.Band_Up.services.AwsService.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final AccountRepository accountRepository;
    private final S3Service s3Service;
    private final ModelMapper modelMapper;

    @Value("${aws.cloudfront.ttl-seconds:86400}")
    private long cloudFrontTtlSeconds;

    // -----------------------------
    // Cập nhật thông tin cá nhân (không liên quan avatar)
    // -----------------------------
    @Override
    public ProfileDto updateProfile(ProfileDto profile, UUID accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException(accountId.toString()));

        account.setName(profile.getName());
        account.setAddress(profile.getAddress());
        account.setBirthday(profile.getBirthday());
        account.setGender(profile.getGender());
        account.setPhone(profile.getPhone());

        accountRepository.save(account);
        return modelMapper.map(account, ProfileDto.class);
    }

    // -----------------------------
    // Sinh Presigned URL để FE upload avatar lên S3
    // -----------------------------
    @Override
    public AvatarDto createAvatarPresignedUrl(String fileName, String contentType, UUID accountId) {
        log.info("[Profile] Creating presigned URL for avatar upload: user={}", accountId);

        String key = String.format("avatars/%s/avatar-%s-%s",
                accountId, UUID.randomUUID(), fileName);

        var uploadInfo = s3Service.createUploadPresignedUrl(key, contentType);

        return AvatarDto.builder()
                .key(uploadInfo.getKey())
                .uploadUrl(uploadInfo.getPresignedUrl())
                .expiresAt(uploadInfo.getExpiresAt())
                .build();
    }

    // -----------------------------
    // Lưu avatarKey vào Account sau khi FE upload xong
    // -----------------------------
    @Override
    public AvatarDto saveAvatar(String key, UUID accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException(accountId.toString()));

        account.setAvatarKey(key);
        accountRepository.save(account);

        String signedUrl = s3Service.createCloudFrontSignedUrl(key);
        Instant expiresAt = Instant.now().plusSeconds(cloudFrontTtlSeconds);

        return AvatarDto.builder()
                .key(key)
                .cloudFrontUrl(signedUrl)  // field hiển thị ảnh
                .expiresAt(expiresAt)
                .build();
    }


    // -----------------------------
    // Lấy avatar CloudFront URL để hiển thị
    // -----------------------------
    @Override
    public AvatarDto getAvatar(UUID accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException(accountId.toString()));

        if (account.getAvatarKey() == null) {
            throw new RuntimeException("User has no avatar uploaded yet");
        }

        String signedUrl = s3Service.createCloudFrontSignedUrl(account.getAvatarKey());
        Instant expiresAt = Instant.now().plusSeconds(cloudFrontTtlSeconds);

        return AvatarDto.builder()
                .key(account.getAvatarKey())
                .cloudFrontUrl(signedUrl)
                .expiresAt(expiresAt)
                .build();
    }
}
