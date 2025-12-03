    package com.project.Band_Up.dtos.media;

    import lombok.*;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public class MediaRequest {
        private String entityType;
        private String entityId;
        private String fileName;
        private String contentType;
    }
