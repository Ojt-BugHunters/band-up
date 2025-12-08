package com.project.Band_Up.dtos.answer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class S3SpeakingUploadUrl {
    private String uploadUrl;
}
