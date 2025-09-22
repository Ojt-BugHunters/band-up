package com.project.Band_Up.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Deck {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @ManyToOne(cascade = CascadeType.ALL)
    private Account account;

    private String title;

    private String description;

    private int number_of_people;

    private boolean isActive;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
