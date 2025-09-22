package com.project.Band_Up.repositories;

import com.project.Band_Up.entities.Deck;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DeckRepository extends JpaRepository<Deck, UUID> {
}
