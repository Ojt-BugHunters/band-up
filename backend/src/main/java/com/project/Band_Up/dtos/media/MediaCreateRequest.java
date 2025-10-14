package com.project.Band_Up.dtos.media;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MediaCreateRequest {
    private UUID entityId;
    private String key;
    private String type;
}
