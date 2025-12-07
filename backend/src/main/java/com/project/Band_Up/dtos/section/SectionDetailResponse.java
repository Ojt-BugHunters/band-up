package com.project.Band_Up.dtos.section;

import com.project.Band_Up.dtos.answer.AnswerDetailResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SectionDetailResponse {
    private UUID SectionId;
    private String title;
    private Integer orderIndex;
    private BigInteger timeLimitSeconds;
    private String metadata;
    private String cloudfrontUrl;
    private List<AnswerDetailResponse> answers;
}
