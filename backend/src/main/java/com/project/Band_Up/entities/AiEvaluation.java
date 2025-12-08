package com.project.Band_Up.entities;

import com.project.Band_Up.dtos.aiSpeaking.AiSpeakingResponse;
import com.project.Band_Up.dtos.aiWriting.AiWritingResponse;
import com.project.Band_Up.enums.EvalType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ai_evaluation")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AiEvaluation {

    @Id
    @GeneratedValue
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "answer_id", nullable = false, unique = true)
    private Answer answer;

    @Enumerated(EnumType.STRING)
    @Column(name = "eval_type", nullable = false)
    private EvalType evalType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "ai_response", columnDefinition = "jsonb")
    private String aiResponse;

    @Column(name = "overall_band")
    private Double overallBand;

    @CreationTimestamp
    private LocalDateTime createdAt;
}

