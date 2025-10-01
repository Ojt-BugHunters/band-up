package com.project.Band_Up.services.quizlet;

import com.project.Band_Up.dtos.quizlet.CardDto;
import com.project.Band_Up.dtos.quizlet.DeckDto;
import com.project.Band_Up.dtos.quizlet.DeckDtoResponse;
import com.project.Band_Up.entities.Account;
import com.project.Band_Up.entities.Card;
import com.project.Band_Up.entities.Deck;
import com.project.Band_Up.exceptions.AuthenticationFailedException;
import com.project.Band_Up.exceptions.ResourceNotFoundException;
import com.project.Band_Up.repositories.AccountRepository;
import com.project.Band_Up.repositories.DeckRepository;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class DeckServiceImpl implements DeckService {

    @Autowired
    private DeckRepository deckRepository;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private AccountRepository accountRepository;

    @Override
    @Transactional
    public DeckDtoResponse createDeck(UUID account_id, DeckDto deckDto) {
        Account account = accountRepository.findById(account_id)
                .orElseThrow(() -> new ResourceNotFoundException(account_id.toString()));

        Deck deck = modelMapper.map(deckDto, Deck.class);
        deck.setAccount(account);

        if (deckDto.getCards() != null) {
            List<Card> cards = new ArrayList<>();
            for (CardDto cardDto : deckDto.getCards()) {
                Card card = modelMapper.map(cardDto, Card.class);
                card.setDeck(deck);
                cards.add(card);
            }
            deck.setCards(cards);
        }

        Deck savedDeck = deckRepository.save(deck);

        DeckDtoResponse deckDtoResponse = modelMapper.map(savedDeck, DeckDtoResponse.class);
        deckDtoResponse.setAuthorName(account.getName());
        return deckDtoResponse;
    }


    public DeckDtoResponse getDeck(UUID deckId) {
        Deck deck = deckRepository.findById(deckId)
                .orElseThrow(() -> new ResourceNotFoundException(deckId.toString()));
        return modelMapper.map(deck, DeckDtoResponse.class);
    }

    public List<DeckDtoResponse> getDecks(Integer pageNo, Integer pageSize, String sortBy, Boolean ascending) {
        Pageable pageable = PageRequest.of(pageNo, pageSize,
                ascending ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending());
        Page<DeckDtoResponse> page = deckRepository.findAll(pageable)
                .map(deck -> {
                    DeckDtoResponse dto = modelMapper.map(deck, DeckDtoResponse.class);
                    dto.setAuthorName(deck.getAccount().getName());
                    return dto;
                });
        if (page.hasContent()) {
            return page.getContent();
        } else {
            return new ArrayList<DeckDtoResponse>();
        }
    }

    @Transactional
    public DeckDto deleteDeck(UUID deckId, UUID accountId) {
        Deck deck = deckRepository.findById(deckId)
                .orElseThrow(() -> new ResourceNotFoundException(deckId.toString()));
        if (!deck.getAccount().getId().equals(accountId))
            throw new AuthenticationFailedException("Unauthorized");
        deckRepository.delete(deck);
        return modelMapper.map(deck, DeckDto.class);
    }

    @Transactional
    public DeckDtoResponse updateDeck(UUID deckId, DeckDto deckDto, UUID accountId) {
        Deck deck = deckRepository.findById(deckId)
                .orElseThrow(() -> new ResourceNotFoundException(deckId.toString()));
        if(!deck.getAccount().getId().equals(accountId))
            throw new AuthenticationFailedException("Unauthorized");
        Deck updatedDeck = modelMapper.map(deckDto, Deck.class);
        if(deckDto.getCards() != null)
            deck.setCards(updatedDeck.getCards());
        deck.setPublic(updatedDeck.isPublic());
        deck.setTitle(updatedDeck.getTitle());
        deck.setDescription(updatedDeck.getDescription());
        deck = deckRepository.save(deck);
        DeckDtoResponse dto = modelMapper.map(deck, DeckDtoResponse.class);
        dto.setAuthorName(deck.getAccount().getName());
        return dto;
    }
}