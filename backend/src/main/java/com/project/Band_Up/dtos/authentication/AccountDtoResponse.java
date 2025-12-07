package com.project.Band_Up.dtos.authentication;

import com.project.Band_Up.dtos.subscription.SubscriptionDtoResponse;
import com.project.Band_Up.enums.Gender;
import com.project.Band_Up.enums.Role;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AccountDtoResponse {

    private UUID id;

    private Role role = Role.Member;

    private String email;

    private String phone;

    private String name;

    private Gender gender;

    private String address;

    private LocalDate birthday;

    private boolean isActive;

    private SubscriptionDtoResponse subscription;

    private LocalDateTime createdAt;
}
