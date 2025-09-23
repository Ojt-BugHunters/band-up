package com.project.Band_Up.dtos.test;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestUpdateRequest {
    @NotNull
    private UUID id;

    private String skillName;
    private String title;
    private Integer numberOfPeople;
    private BigInteger durationSeconds;
}
