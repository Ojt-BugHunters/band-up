package com.project.Band_Up.dtos.subscription;

import com.project.Band_Up.enums.SubscriptionType;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SubscriptionDtoResponse {

    private UUID id;

    private SubscriptionType subscriptionType;

    private String description;

    private LocalDate startDate;

    private LocalDate endDate;

    private boolean isLifeTime;

    private LocalDateTime createdAt;
}

