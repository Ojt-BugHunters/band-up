package com.project.Band_Up.controllers;

import com.project.Band_Up.dtos.quizlet.DeckDto;
import com.project.Band_Up.services.quizlet.DeckService;
import com.project.Band_Up.utils.JwtUtil;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/quizlet")
@Tag(name = "Deck API", description = "Các endpoint để quản lý Deck (tạo, đọc, cập nhật, xóa).")
public class DeckController {

    @Autowired
    private DeckService deckService;
    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/deck/create")
    public ResponseEntity<?> createDeck(@RequestBody DeckDto deckDto,
                                        @CookieValue(name = "AccessToken", required = true)
                                        String accessToken) {
        String accountId = jwtUtil.extractSubject(accessToken);
        DeckDto deck = deckService.createDeck(UUID.fromString(accountId), deckDto);
        return ResponseEntity.ok()
                .body(deck);
    }

    @GetMapping("/deck/{deckId}")
    public ResponseEntity<?> getDeck(@PathVariable(name = "deckId") UUID deckId) {
        return ResponseEntity.ok()
                .body(deckService.getDeck(deckId));
    }

    @GetMapping("/deck")
    public ResponseEntity<?> getDecks(@RequestParam(defaultValue = "0") Integer pageNo,
                                      @RequestParam(defaultValue = "8") Integer pageSize,
                                      @RequestParam(defaultValue = "id") String sortBy,
                                      @RequestParam(defaultValue = "true" ) Boolean ascending) {
        return ResponseEntity.ok()
                .body(deckService.getDecks(pageNo, pageSize, sortBy, ascending));
    }

    @DeleteMapping("/deck/{deckId}/delete")
    public ResponseEntity<?> deleteDeck(@PathVariable(name = "deckId") UUID deckId) {
        return ResponseEntity.ok()
                .body(deckService.deleteDeck(deckId));
    }

    @PutMapping("/deck/{deckId}/update")
    public ResponseEntity<?> updateDeck(@PathVariable(name = "deckId") UUID deckId,
                                        @RequestBody DeckDto deckDto) {
        return ResponseEntity.ok().body(deckService.updateDeck(deckId,deckDto));
    }
}
