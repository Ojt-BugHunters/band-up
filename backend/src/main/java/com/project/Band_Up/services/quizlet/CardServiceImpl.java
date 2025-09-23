package com.project.Band_Up.services.quizlet;

import com.project.Band_Up.dtos.quizlet.CardDto;
import com.project.Band_Up.entities.Card;
import com.project.Band_Up.entities.Deck;
import com.project.Band_Up.exceptions.ResourceNotFoundException;
import com.project.Band_Up.repositories.CardRepository;
import com.project.Band_Up.repositories.DeckRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class CardServiceImpl implements CardService {
    @Autowired
    private CardRepository cardRepository;
    @Autowired
    private DeckRepository deckRepository;
    @Autowired
    private ModelMapper modelMapper;

    @Override
    public List<CardDto> createCard(List<CardDto> cardDtos, String deckId) {
        List<Card> cards = cardDtos.stream()
                .map(cardDto -> modelMapper.map(cardDto, Card.class)).toList();
        if (deckRepository.existsById(UUID.fromString(deckId))) {
            Deck deck = deckRepository.findDeckById((UUID.fromString(deckId)));
            cards.forEach(card -> card.setDeck(deck));
        } else throw new ResourceNotFoundException(deckId);
        cardRepository.saveAll(cards);
        return cards.stream()
                .map(card -> modelMapper.map(card, CardDto.class)).toList();
    }

    public List<CardDto> getCards(String deckId){
        if (deckRepository.existsById(UUID.fromString(deckId))){
            Deck deck = deckRepository.findDeckById((UUID.fromString(deckId)));
            return cardRepository.findByDeck(deck)
                    .stream()
                    .map(card -> modelMapper.map(card, CardDto.class))
                    .toList();
        } else throw new ResourceNotFoundException(deckId);
    }
}
