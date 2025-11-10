package com.project.Band_Up.dtos.roomChat;

import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MessageDto {
    private String content;
    private SenderDto sender;
    private String target;
    private List<String> images;
}
