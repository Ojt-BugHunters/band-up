package com.project.Band_Up.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "attempt_section")
public class AttemptSection {
    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.TIME)
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)  // Người dùng
    @JoinColumn (name = "attempt_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_attempt_section_attempt"))
    private Attempt attempt ;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)  // Người dùng
    @JoinColumn (name = "section_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_attempt_section_section"))
    private Section section ;
    private LocalDateTime startAt;
}
