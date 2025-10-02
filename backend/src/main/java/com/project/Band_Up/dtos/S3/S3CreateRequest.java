package com.project.Band_Up.dtos.S3;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class S3CreateRequest {
    private String fileKey;

}
