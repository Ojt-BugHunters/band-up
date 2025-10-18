package com.project.Band_Up.dtos.section;

import com.project.Band_Up.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SectionCreateRequest {
    private String title;
    private Integer orderIndex;
    private BigInteger timeLimitSeconds;
    private Map<String, Object> metadata;
}
