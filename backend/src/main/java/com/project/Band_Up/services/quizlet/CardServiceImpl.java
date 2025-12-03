package com.project.Band_Up.services.quizlet;

import com.project.Band_Up.dtos.quizlet.CardDto;
import com.project.Band_Up.entities.Card;
import com.project.Band_Up.entities.Deck;
import com.project.Band_Up.exceptions.AuthenticationFailedException;
import com.project.Band_Up.exceptions.ResourceNotFoundException;
import com.project.Band_Up.repositories.CardRepository;
import com.project.Band_Up.repositories.DeckRepository;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public List<CardDto> createCard(List<CardDto> cardDtos, UUID deckId) {
        List<Card> cards = cardDtos.stream()
                .map(cardDto -> modelMapper.map(cardDto, Card.class)).toList();
        if (deckRepository.existsById(deckId)) {
            Deck deck = deckRepository.findDeckById(deckId);
            cards.forEach(card -> card.setDeck(deck));
        } else throw new ResourceNotFoundException(deckId.toString());
        cardRepository.saveAll(cards);
        return cards.stream()
                .map(card -> modelMapper.map(card, CardDto.class)).toList();
    }

    public List<CardDto> getCards(UUID deckId, String password){
        if (deckRepository.existsById(deckId)){
            Deck deck = deckRepository.findDeckById(deckId);
            if(!deck.isPublic()){
                if(passwordEncoder.matches(password, deck.getPassword())){
                    return cardRepository.findByDeck(deck)
                            .stream()
                            .map(card -> modelMapper.map(card, CardDto.class))
                            .toList();
                } else throw new AuthenticationFailedException("Invalid password");
            }
            return cardRepository.findByDeck(deck)
                    .stream()
                    .map(card -> modelMapper.map(card, CardDto.class))
                    .toList();
        } else throw new ResourceNotFoundException(deckId.toString());
    }

    @Transactional
    public CardDto deleteCard(UUID cardId, UUID accountId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException(cardId.toString()));
        if (!card.getDeck().getAccount().getId().equals(accountId))
            throw new AuthenticationFailedException("Unauthorized");
        cardRepository.delete(card);
        return modelMapper.map(card, CardDto.class);
    }

    @Transactional
    public CardDto updateCard(UUID cardId, CardDto cardDto,  UUID accountId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException(cardId.toString()));
        if (!card.getDeck().getAccount().getId().equals(accountId))
            throw new AuthenticationFailedException("Unauthorized");
        Card updatedCard = modelMapper.map(cardDto, Card.class);
        card.setBack(updatedCard.getBack());
        card.setFront(updatedCard.getFront());
        card = cardRepository.saveAndFlush(card);
        return modelMapper.map(card, CardDto.class);
    }
}
