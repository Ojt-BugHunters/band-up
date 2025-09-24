package com.project.Band_Up.dtos.profile;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.project.Band_Up.enums.Gender;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileDto {

    @Pattern(regexp = "^(\\+\\d{1,3}[- ]?)?\\d{10}$", message = "Invalid phone number")
    private String phone;

    private String name;

    private Gender gender;

    private String address;

    @JsonFormat(pattern = "dd-MM-yyyy", shape =  JsonFormat.Shape.STRING)
    private LocalDate birthday;
}
