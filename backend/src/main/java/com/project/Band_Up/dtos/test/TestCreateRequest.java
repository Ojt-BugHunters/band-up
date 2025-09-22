package com.project.Band_Up.dtos.test;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestCreateRequest {
    @NotNull
    private String userId;

    @NotNull
    private String skillName;

    @NotNull
    private String title;

    private Integer numberOfPeople;

    @NotNull
    private BigInteger durationSeconds;
}
