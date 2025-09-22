package com.project.Band_Up.repositories;

import com.project.Band_Up.entities.Card;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CardRepository extends JpaRepository<Card, UUID> {
}
