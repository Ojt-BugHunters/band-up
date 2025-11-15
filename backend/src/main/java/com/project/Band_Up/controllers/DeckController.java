package com.project.Band_Up.controllers;

import com.project.Band_Up.dtos.quizlet.DeckDto;
import com.project.Band_Up.dtos.quizlet.DeckDtoResponse;
import com.project.Band_Up.enums.StatsInterval;
import com.project.Band_Up.services.quizlet.DeckService;
import com.project.Band_Up.services.quizlet.QuizletStatService;
import com.project.Band_Up.utils.JwtUserDetails;
import com.project.Band_Up.utils.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/quizlet")
@Tag(name = "Deck API", description = "Các endpoint để quản lý Deck (tạo, đọc, cập nhật, xóa).")
public class DeckController {

    @Autowired
    private DeckService deckService;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private QuizletStatService quizletStatService;

    @PostMapping("/deck/create")
    @Operation(summary = "Create new deck",
            description = "Creating new deck ( and card if sent with ) and return the created deck details")
    public ResponseEntity<?> createDeck(@RequestBody DeckDto deckDto,
                                        @AuthenticationPrincipal JwtUserDetails userDetails) {
        DeckDtoResponse deck = deckService.createDeck(userDetails.getAccountId(), deckDto);
        return ResponseEntity.ok()
                .body(deck);
    }

    @PostMapping("/deck/{deckId}")
    @Operation(summary = "Get deck by deckId",
            description = "Return the deck specified by deckId")
    public ResponseEntity<?> getDeck(@PathVariable(name = "deckId") UUID deckId,
                                     @RequestBody String password) {
        return ResponseEntity.ok()
                .body(deckService.getDeck(deckId,password));
    }

    @GetMapping("/deck")
    public ResponseEntity<?> getDecks(@RequestParam(defaultValue = "0") Integer pageNo,
                                      @RequestParam(defaultValue = "8") Integer pageSize,
                                      @RequestParam(defaultValue = "id") String sortBy,
                                      @RequestParam(defaultValue = "true" ) Boolean ascending,
                                      @RequestParam(defaultValue = "") String queryBy,
                                      @RequestParam(defaultValue = "all") String visibility,
                                      @RequestParam(defaultValue = "false") boolean isLearned,
                                      @AuthenticationPrincipal JwtUserDetails userDetails) {
        return ResponseEntity.ok()
                .body(deckService.getDecks(pageNo, pageSize, sortBy, ascending, queryBy, visibility, isLearned, userDetails == null ? null : userDetails.getAccountId()));
    }

    @DeleteMapping("/deck/{deckId}/delete")
    @Operation(summary = "Delete deck",
            description = "Delete deck specified by deckId")
    public ResponseEntity<?> deleteDeck(@PathVariable(name = "deckId") UUID deckId,
                                        @AuthenticationPrincipal JwtUserDetails userDetails) {
        return ResponseEntity.ok()
                .body(deckService.deleteDeck(deckId, userDetails.getAccountId()));
    }

    @PutMapping("/deck/{deckId}/update")
    @Operation(summary = "Update deck information",
            description = "Update the deck information such as title, description specified by deckId")
    public ResponseEntity<?> updateDeck(@PathVariable(name = "deckId") UUID deckId,
                                        @RequestBody DeckDto deckDto,
                                        @AuthenticationPrincipal JwtUserDetails userDetails) {
        return ResponseEntity.ok()
                .body(deckService.updateDeck(deckId,deckDto, userDetails.getAccountId()));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get Quizlet statistics",
            description = "Retrieve statistics for decks, cards, learners, and completion rate with differences calculated based on the specified interval (DAILY, WEEKLY, MONTHLY, or YEARLY)")
    public ResponseEntity<?> getStats(
            @Parameter(description = "Time interval for calculating statistics differences (DAILY, WEEKLY, MONTHLY, YEARLY)",
                      required = true,
                      example = "WEEKLY")
            @RequestParam StatsInterval statsInterval) {
        return ResponseEntity.ok().body(quizletStatService.getStats(statsInterval));
    }

    @GetMapping("/stats/completion-rate")
    @Operation(summary = "Get completion rate by year",
            description = "Retrieve the completion rate for each month of the specified year. Returns monthly completion rate data for visualization and analysis.")
    public ResponseEntity<?> getCompletionRate(
            @Parameter(description = "Year for which to retrieve completion rate data",
                      required = true,
                      example = "2025")
            @RequestParam int year) {
        return ResponseEntity.ok().body(quizletStatService.getCompletionRate(year));
    }

    @PostMapping("/deck/{deckId}/add-learner")
    public ResponseEntity<?> addLearner(@PathVariable(name = "deckId") UUID deckId,
                                        @AuthenticationPrincipal JwtUserDetails userDetails) {
        deckService.updateLearnerNumber(deckId, userDetails.getAccountId());
        return ResponseEntity.ok().build();
    }
}
