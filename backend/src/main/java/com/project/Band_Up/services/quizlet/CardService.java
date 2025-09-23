package com.project.Band_Up.services.quizlet;

import com.project.Band_Up.dtos.quizlet.CardDto;

import java.util.List;

public interface CardService {
    public List<CardDto> createCard(List<CardDto> cardDtos, String deckId);
    public List<CardDto> getCards(String deckId);
}
