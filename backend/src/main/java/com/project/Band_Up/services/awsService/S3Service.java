package com.project.Band_Up.services.awsService;

import com.project.Band_Up.dtos.media.UploadInfo;

public interface S3Service {
    public UploadInfo createUploadPresignedUrl(String key, String contentType);
    public String createCloudFrontSignedUrl(String key);
    public boolean exists(String key);
    void deleteObject(String key);
}
