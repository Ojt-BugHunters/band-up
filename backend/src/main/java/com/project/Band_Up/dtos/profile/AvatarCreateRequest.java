package com.project.Band_Up.dtos.profile;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AvatarCreateRequest {
    private String fileName;
    private String contentType;
}
