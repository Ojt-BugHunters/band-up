package com.project.Band_Up.dtos.authentication;

import com.project.Band_Up.enums.Gender;
import com.project.Band_Up.enums.Role;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;

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

}
