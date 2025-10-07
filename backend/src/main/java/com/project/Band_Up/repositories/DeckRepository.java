package com.project.Band_Up.repositories;

import aj.org.objectweb.asm.commons.Remapper;
import com.project.Band_Up.entities.Deck;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DeckRepository extends JpaRepository<Deck, UUID> {
    Deck findDeckById(UUID id);

    Page<Deck> findAllByPublicIs(boolean aPublic, Pageable pageable);

    Page<Deck> findAllByPublicIsAndTitleContainingIgnoreCase(boolean aPublic, String title, Pageable pageable);

    Page<Deck> findAllByTitleContainingIgnoreCase(String title, Pageable pageable);
}
