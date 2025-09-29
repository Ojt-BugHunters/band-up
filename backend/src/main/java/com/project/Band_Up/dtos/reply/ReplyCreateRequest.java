package com.project.Band_Up.dtos.reply;

import lombok.*;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReplyCreateRequest {
    private String content;
}
