package com.project.Band_Up.services.quizlet;

import com.project.Band_Up.dtos.quizlet.CardDto;
import com.project.Band_Up.dtos.quizlet.DeckDto;
import com.project.Band_Up.dtos.quizlet.DeckDtoResponse;
import com.project.Band_Up.dtos.quizlet.DeckResponse;
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
import org.springframework.security.crypto.password.PasswordEncoder;
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
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public DeckDtoResponse createDeck(UUID account_id, DeckDto deckDto) {
        Account account = accountRepository.findById(account_id)
                .orElseThrow(() -> new ResourceNotFoundException(account_id.toString()));

        Deck deck = modelMapper.map(deckDto, Deck.class);
        if(!deck.isPublic() && !deckDto.getPassword().isEmpty())
            deck.setPassword(passwordEncoder.encode(deck.getPassword()));
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


    public DeckResponse getDeck(UUID deckId, String password) {
        Deck deck = deckRepository.findById(deckId)
                .orElseThrow(() -> new ResourceNotFoundException(deckId.toString()));
        if(!deck.isPublic()) {
            if (passwordEncoder.matches(password, deck.getPassword())) {
                return modelMapper.map(deck, DeckResponse.class);
            } else throw new AuthenticationFailedException("Invalid password");
        }
        return modelMapper.map(deck, DeckResponse.class);
    }

    @Override
    public Page<DeckDtoResponse> getDecks(Integer pageNo, Integer pageSize,
                                          String sortBy, Boolean ascending,
                                          String queryBy, String visibility) {
        Pageable pageable = PageRequest.of(
                pageNo,
                pageSize,
                ascending ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending()
        );

        Page<Deck> decks;
        if (visibility.equalsIgnoreCase("all")) {
            decks = queryBy.isEmpty() ?
                    deckRepository.findAll(pageable) :
                    deckRepository.findAllByTitleContainingIgnoreCase(queryBy, pageable);
        } else {
            boolean isPublic = visibility.equalsIgnoreCase("public");
            decks = queryBy.isEmpty() ?
                    deckRepository.findAllByIsPublic(isPublic, pageable) :
                    deckRepository.findAllByIsPublicIsAndTitleContainingIgnoreCase(isPublic, queryBy, pageable);
        }

        return decks.map(deck -> {
            DeckDtoResponse dto = modelMapper.map(deck, DeckDtoResponse.class);
            dto.setAuthorName(deck.getAccount().getName());
            return dto;
        });
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