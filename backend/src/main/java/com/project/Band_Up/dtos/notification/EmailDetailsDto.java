package com.project.Band_Up.dtos.notification;

import lombok.*;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EmailDetailsDto {

    private String recipient;
    private String subject;
    private String msgBody;
    private String attachment;

}
