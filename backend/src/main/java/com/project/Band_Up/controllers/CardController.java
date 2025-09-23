package com.project.Band_Up.controllers;

import com.project.Band_Up.dtos.quizlet.CardDto;
import com.project.Band_Up.services.quizlet.CardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/quizlet")
public class CardController {

    @Autowired
    private CardService cardService;

    @PostMapping("/{deckId}/card/create")
    public ResponseEntity<?> createCard(@RequestBody List<CardDto> cards,
                                        @PathVariable String deckId) {
        List<CardDto> cardDtos = cardService.createCard(cards, deckId);
        return ResponseEntity.ok().body(cardDtos);
    }

    @GetMapping("/{deckId}/card")
    public ResponseEntity<?> getCards(@PathVariable String deckId) {
        List<CardDto> cardDtos = cardService.getCards(deckId);
        return ResponseEntity.ok().body(cardDtos);
    }
}
