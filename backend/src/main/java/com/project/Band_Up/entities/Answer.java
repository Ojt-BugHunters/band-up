    package com.project.Band_Up.entities;

    import jakarta.persistence.*;
    import lombok.*;
    import org.hibernate.annotations.CreationTimestamp;
    import org.hibernate.annotations.JdbcTypeCode;
    import org.hibernate.annotations.UuidGenerator;
    import org.hibernate.type.SqlTypes;

    import java.time.LocalDateTime;
    import java.util.List;
    import java.util.Map;
    import java.util.UUID;

    @AllArgsConstructor
    @Builder
    @Entity
    @NoArgsConstructor
    @Getter
    @Setter
    public class Answer {
        @Id
        @GeneratedValue
        @UuidGenerator(style = UuidGenerator.Style.TIME)
        private UUID id;
        @ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
        @JoinColumn(name = "question_id",
                foreignKey = @ForeignKey(name = "fk_answer_question"))
        private Question question;
        @ManyToOne(fetch = jakarta.persistence.FetchType.LAZY, optional = false)
        @JoinColumn(name = "attempt_section_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_answer_attempt_section"))
        private AttemptSection attemptSection;

        @Column(columnDefinition = "text")
        private String answerContent;

        private boolean isCorrect;
        @JdbcTypeCode(SqlTypes.JSON)
        @Column(columnDefinition = "jsonb")
        private List<Map<String, Object>> mistakes;
        private String s3AudioUrl;
        private double accuracy;
        @CreationTimestamp
        @Column(name = "create_at", nullable = false, updatable = false)
        private LocalDateTime createAt;
    }
