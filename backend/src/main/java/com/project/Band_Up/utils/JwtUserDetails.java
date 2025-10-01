package com.project.Band_Up.utils;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class JwtUserDetails {
    private UUID accountId;
    private String role;
}