package com.project.Band_Up.dtos.aiFlashCard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FlashCardS3UploadResponse {
    private String uploadUrl;
    private String s3Key;
}
