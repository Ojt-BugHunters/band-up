package com.project.Band_Up.dtos.answer;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request to save writing answer before AI evaluation")
public class SaveWritingAnswerRequest {

    @NotBlank(message = "Answer content is required")
    private String answerContent;
}