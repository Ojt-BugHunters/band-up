package com.project.Band_Up.dtos.roomChat;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SenderDto {
    private UUID id;
    private String name;
}
