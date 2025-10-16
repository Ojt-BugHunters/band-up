package com.project.Band_Up.entities;

import com.project.Band_Up.enums.Status;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigInteger;
import java.time.LocalDateTime;
import java.util.UUID;

@AllArgsConstructor
@Builder
@Entity
@NoArgsConstructor
@Getter
@Setter
@Table(name = "test")
public class Test {
    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.TIME)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)  // Người dùng
    @JoinColumn (name = "user_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_test_user"))
    private Account user ;

    @NotNull
    private String skillName;

    @NotNull
    private String title;

    private Integer numberOfPeople;

    @NotNull
    private BigInteger durationSeconds; // in seconds

    @CreationTimestamp
    @Column(name = "create_at", nullable = false, updatable = false)
    private LocalDateTime createAt;

    @Enumerated(EnumType.STRING)
    private Status status;

}
