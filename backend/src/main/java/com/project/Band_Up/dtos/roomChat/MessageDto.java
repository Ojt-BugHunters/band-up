package com.project.Band_Up.dtos.roomChat;

import com.project.Band_Up.enums.RoomAction;
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
    private UUID target;
    private List<String> images;
    private RoomAction action;
}
