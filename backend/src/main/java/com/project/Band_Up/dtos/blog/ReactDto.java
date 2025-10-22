package com.project.Band_Up.dtos.blog;

import com.project.Band_Up.enums.ReactType;
import lombok.*;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReactDto {
    private ReactType reactType;
}
