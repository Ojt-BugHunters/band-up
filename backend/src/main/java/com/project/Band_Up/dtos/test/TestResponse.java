package com.project.Band_Up.dtos.test;

import lombok.*;

import java.math.BigInteger;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TestResponse {
    private UUID userId;
    private UUID id;
    private String title;
    private String skillName;
    private Integer number_of_people;
    private BigInteger duration_seconds;
    private LocalDateTime createAt;
}
