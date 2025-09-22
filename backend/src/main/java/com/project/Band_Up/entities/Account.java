package com.project.Band_Up.entities;

import com.project.Band_Up.enums.Gender;
import com.project.Band_Up.enums.Role;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@AllArgsConstructor
@Builder
@Entity
@NoArgsConstructor
@Getter
@Setter
@Table(name = "account")
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @Enumerated(EnumType.STRING)
    private Role role = Role.Member;

    @NotNull
    private String email;

    private String phone;

    @NotNull
    private String password;

    private String name;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private String address;

    @DateTimeFormat(pattern = "dd-MM-yyyy")
    private LocalDate birthday;

    private boolean isActive;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
