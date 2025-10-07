package com.project.Band_Up.dtos.media;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MediaRequest {
    private String EntityType;
    private String EntityId;
    private String FileName;
    private String contentType;
}
