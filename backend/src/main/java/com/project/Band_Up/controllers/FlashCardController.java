package com.project.Band_Up.controllers;

import com.project.Band_Up.dtos.aiFlashCard.AiFlashCardRequest;
import com.project.Band_Up.dtos.aiFlashCard.FlashCardS3UploadRequest;
import com.project.Band_Up.dtos.aiFlashCard.FlashCardS3UploadResponse;
import com.project.Band_Up.dtos.quizlet.DeckResponse;
import com.project.Band_Up.services.aiEvaluation.FlashCardGenService;
import com.project.Band_Up.utils.JwtUserDetails;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/flashcards")
public class FlashCardController {

    @Autowired
    private FlashCardGenService flashCardGenService;

    /**
     * Generate presigned URL for uploading PDF
     */
    @PostMapping("/Document-upload-url")
    public ResponseEntity<FlashCardS3UploadResponse> generateUploadUrl(
            @RequestBody FlashCardS3UploadRequest request,
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        UUID userId = userDetails.getAccountId();
        FlashCardS3UploadResponse response = flashCardGenService.generateDocumentUploadUrl(request, userId);

        return ResponseEntity.ok(response);
    }

    /**
     * Generate flashcards from PDF and create deck
     */
    @PostMapping("/FlashCard-generate")
    public ResponseEntity<DeckResponse> generateFlashCards(
            @RequestBody AiFlashCardRequest request,
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        UUID userId = userDetails.getAccountId();
        DeckResponse response = flashCardGenService.generateFlashCardsAndCreateDeck(request, userId);

        return ResponseEntity.ok(response);
    }
}