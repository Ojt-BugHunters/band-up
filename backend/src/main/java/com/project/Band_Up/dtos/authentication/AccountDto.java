package com.project.Band_Up.dtos.authentication;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AccountDto {

    @Email(message = "Wrong email")
    private String email;

    @Size(min = 6, max = 200)
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$",
            message = "Password must contain at least one lowercase, one uppercase, one digit, and one special character"
    )
    private String password;
}
