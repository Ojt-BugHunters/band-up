package com.project.Band_Up.repositories;

import com.project.Band_Up.entities.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    void deleteByToken(String refreshToken);

    boolean existsByToken(String refreshToken);

    RefreshToken findByToken(String refreshToken);
}
