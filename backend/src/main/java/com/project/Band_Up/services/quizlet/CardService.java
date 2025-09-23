package com.project.Band_Up.services.quizlet;

import com.project.Band_Up.dtos.quizlet.CardDto;

import java.util.List;
import java.util.UUID;

public interface CardService {

    public List<CardDto> createCard(List<CardDto> cardDtos, UUID deckId);

    public List<CardDto> getCards(UUID deckId);

    public CardDto deleteCard(UUID cardId);

    public CardDto updateCard(UUID cardId, CardDto cardDto);
}
