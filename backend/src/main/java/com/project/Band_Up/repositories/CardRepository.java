package com.project.Band_Up.repositories;

import com.project.Band_Up.dtos.quizlet.CardDto;
import com.project.Band_Up.entities.Card;
import com.project.Band_Up.entities.Deck;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CardRepository extends JpaRepository<Card, UUID> {
    List<Card> findByDeck(Deck deck);
}
