package com.project.Band_Up.services.aiEvaluation;

import com.project.Band_Up.dtos.aiFlashCard.AiFlashCardRequest;
import com.project.Band_Up.dtos.aiFlashCard.FlashCardS3UploadRequest;
import com.project.Band_Up.dtos.aiFlashCard.FlashCardS3UploadResponse;
import com.project.Band_Up.dtos.quizlet.DeckResponse;

import java.util.UUID;

public interface FlashCardGenService {

    /**
     * Generate presigned URL for uploading PDF to S3
     */
    FlashCardS3UploadResponse generateDocumentUploadUrl(FlashCardS3UploadRequest request, UUID userId);

    /**
     * Generate flashcards from AI API and create deck with cards
     */
    DeckResponse generateFlashCardsAndCreateDeck(AiFlashCardRequest request, UUID userId);
}