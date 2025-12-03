package com.project.Band_Up.entities;

import com.project.Band_Up.enums.SubscriptionType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
public class Subscriptions {

    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Enumerated(EnumType.STRING)
    private SubscriptionType subscriptionType;

    private String description;

    private LocalDate startDate;

    private LocalDate endDate;

    private boolean isLifeTime;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
