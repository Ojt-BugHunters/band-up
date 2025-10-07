package com.project.Band_Up.services.media;

import com.project.Band_Up.dtos.media.MediaRequest;
import com.project.Band_Up.dtos.media.MediaResponse;

public interface MediaService {
    MediaResponse createPresignedUploadUrl(MediaRequest request);
    MediaResponse createCloudFrontSignedUrl(String key);
}
