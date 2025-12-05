package com.project.Band_Up.dtos.attempt;

import com.project.Band_Up.dtos.answer.IeltsAnswerResponse;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestResultResponseDTO {
    private UUID testId;
    private int totalScore;
    private double bandScore;
    private List<IeltsAnswerResponse> responses;
}
