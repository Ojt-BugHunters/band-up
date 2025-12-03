package com.project.Band_Up.repositories;

import com.project.Band_Up.entities.Account;
import com.project.Band_Up.entities.Deck;
import com.project.Band_Up.entities.StudyProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StudyProgressRepository extends JpaRepository<StudyProgress, UUID> {
    boolean existsByDeckAndAccount(Deck deck, Account account);

    void deleteAllByDeck(Deck deck);

    @Query("SELECT DISTINCT sp.account FROM StudyProgress sp")
    List<Account> findDistinctAccounts();

    @Query("SELECT COUNT(DISTINCT sp.deck) FROM StudyProgress sp")
    long countDistinctDeck();
}
