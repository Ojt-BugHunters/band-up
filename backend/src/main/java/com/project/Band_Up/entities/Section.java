package com.project.Band_Up.entities;

import com.project.Band_Up.enums.Status;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

import java.math.BigInteger;
import java.util.Map;
import java.util.UUID;

@AllArgsConstructor
@Builder
@Entity
@NoArgsConstructor
@Getter
@Setter
@Table(name = "section")
public class Section {
    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.TIME)
    private UUID id;

    @ManyToOne (fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "test_id", nullable = false, foreignKey = @ForeignKey(name = "fk_section_test"))
    private Test test;

    @NotNull
    private String title;

    @NotNull
    private Integer orderIndex;
    private BigInteger timeLimitSeconds;

    private String metadata;

    @Enumerated(EnumType.STRING)
    private Status status;
}
