package com.project.Band_Up.services.quizlet;

import com.project.Band_Up.dtos.quizlet.DeckDto;
import com.project.Band_Up.dtos.quizlet.DeckDtoResponse;
import com.project.Band_Up.entities.Deck;

import java.util.List;
import java.util.UUID;

public interface DeckService {

    public DeckDtoResponse createDeck(UUID account_id, DeckDto deckDto);

    public List<DeckDtoResponse> getDecks(Integer pageNo, Integer pageSize, String sortBy, Boolean ascending);

    public DeckDtoResponse getDeck(UUID deckId, String password);

    public DeckDto deleteDeck(UUID deckId, UUID accountId);

    public DeckDtoResponse updateDeck(UUID deckId, DeckDto deckDto, UUID accountId);

}
