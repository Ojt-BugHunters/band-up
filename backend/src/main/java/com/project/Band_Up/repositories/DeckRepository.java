package com.project.Band_Up.repositories;

import aj.org.objectweb.asm.commons.Remapper;
import com.project.Band_Up.entities.Deck;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface DeckRepository extends JpaRepository<Deck, UUID> {
    Deck findDeckById(UUID id);

    Page<Deck> findAllByTitleContainingIgnoreCase(String title, Pageable pageable);

    Page<Deck> findAllByIsPublic(boolean isPublic, Pageable pageable);

    Page<Deck> findAllByIsPublicIsAndTitleContainingIgnoreCase(boolean isPublic, String queryBy, Pageable pageable);

    @Query("SELECT SUM(d.learnerNumber) FROM Deck d")
    long sumLearnerNumber();

    @Query("""
        SELECT d FROM Deck d
        JOIN StudyProgress sp ON sp.deck = d
        WHERE sp.account.id = :accountId
        """)
    Page<Deck> findLearnedDecksByAccountId(UUID accountId, Pageable pageable);

    @Query("""
        SELECT d FROM Deck d
        JOIN StudyProgress sp ON sp.deck = d
        WHERE sp.account.id = :accountId
        AND LOWER(d.title) LIKE LOWER(CONCAT('%', :queryBy, '%'))
        """)
    Page<Deck> findLearnedDecksByAccountIdAndTitle(UUID accountId, String queryBy, Pageable pageable);

}
