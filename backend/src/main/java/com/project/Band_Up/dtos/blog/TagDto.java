package com.project.Band_Up.dtos.blog;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TagDto {
    private UUID id;
    private String name;
}
