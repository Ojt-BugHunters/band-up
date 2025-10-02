package com.project.Band_Up.dtos.S3;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class S3Response {
    private String uploadUrl;
    private String fileKey;
}
