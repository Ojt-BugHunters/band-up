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
import java.util.List;
import java.util.UUID;

@AllArgsConstructor
@Builder
@Entity
@NoArgsConstructor
@Getter
@Setter
@Table(name = "account")
@Data
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @Column(name = "role", nullable = false, columnDefinition = "varchar(255) default 'Member'")
    @Enumerated(EnumType.STRING)
    private Role role = Role.Member;

    @NotNull
    private String email;

    private String phone;

    private String password;

    private String name;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private String address;

    private String avatarKey;

    @DateTimeFormat(pattern = "dd-MM-yyyy")
    private LocalDate birthday;

    private Integer bestSession;
                                                                                                                                                                                                                            @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "account", cascade = CascadeType.ALL)
    private List<Deck> decks;

}
