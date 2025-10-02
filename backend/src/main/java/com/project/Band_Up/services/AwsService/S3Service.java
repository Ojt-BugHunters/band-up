package com.project.Band_Up.services.AwsService;

import java.time.Duration;
import java.util.UUID;

public interface S3Service {
    public String presignUploadUrl(String key, String contentType, Duration expiration, UUID Id);
    public String presignDownloadUrl(String key, Duration expiration);
    public boolean exists(String key);
}
