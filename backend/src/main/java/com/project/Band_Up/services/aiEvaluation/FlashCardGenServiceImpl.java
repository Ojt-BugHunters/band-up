package com.project.Band_Up.services.aiEvaluation;

import com.project.Band_Up.configs.AiFlashCardConfig;
import com.project.Band_Up.dtos.aiFlashCard.*;
import com.project.Band_Up.dtos.media.UploadInfo;
import com.project.Band_Up.dtos.quizlet.CardDto;
import com.project.Band_Up.dtos.quizlet.DeckResponse;
import com.project.Band_Up.entities.Account;
import com.project.Band_Up.entities.Card;
import com.project.Band_Up.entities.Deck;
import com.project.Band_Up.exceptions.ResourceNotFoundException;
import com.project.Band_Up.repositories.AccountRepository;
import com.project.Band_Up.repositories.CardRepository;
import com.project.Band_Up.repositories.DeckRepository;
import com.project.Band_Up.services.awsService.S3Service;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
public class FlashCardGenServiceImpl implements FlashCardGenService {

    @Autowired
    private S3Service s3Service;

    @Autowired
    private DeckRepository deckRepository;

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private AiFlashCardConfig aiFlashCardConfig;  // ✅ THÊM CONFIG

    @Value("${aws.s3.bucket.document}")
    private String documentBucket;

    private static final String DEFAULT_PDF_CONTENT_TYPE = "application/pdf";
    private static final String UPLOADS_FOLDER = "uploads";

    @Override
    public FlashCardS3UploadResponse generateDocumentUploadUrl(FlashCardS3UploadRequest request, UUID userId) {
        log.info("========== GENERATE DOCUMENT UPLOAD URL START ==========");
        log.info("User ID: {}", userId);
        log.info("File name: {}", request.getFileName());
        log.info("Document bucket: {}", documentBucket);

        try {
            // Validate user exists
            Account account = accountRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

            // Create S3 key: uploads/{fileName}
            String s3Key = String.format("%s/%s", UPLOADS_FOLDER, sanitizeFileName(request.getFileName()));

            log.info("Generated S3 key: {}", s3Key);

            // Generate presigned URL using the document bucket
            UploadInfo uploadInfo = s3Service.createUploadPresignedUrlWithBucket(
                    documentBucket,
                    s3Key,
                    DEFAULT_PDF_CONTENT_TYPE
            );

            log.info("Presigned URL generated successfully for bucket: {}", documentBucket);
            log.info("Expires at: {}", uploadInfo.getExpiresAt());
            log.info("========== GENERATE DOCUMENT UPLOAD URL END ==========\n");
            String cleanKey = s3Key.startsWith("/") ? s3Key.substring(1) : s3Key;
            String s3Uri = String.format("s3://%s/%s", documentBucket, cleanKey);
            return FlashCardS3UploadResponse.builder()
                    .uploadUrl(uploadInfo.getPresignedUrl())
                    .s3Key(s3Uri)
                    .build();

        } catch (Exception e) {
            log.error("Failed to generate presigned URL: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate upload URL for document", e);
        }
    }

    @Override
    @Transactional
    public DeckResponse generateFlashCardsAndCreateDeck(AiFlashCardRequest request, UUID userId) {
        log.info("========== GENERATE FLASHCARDS AND CREATE DECK START ==========");
        log.info("User ID: {}", userId);
        log.info("PDF URL: {}", request.getPdfUrl());
        log.info("Number of cards: {}", request.getNumCards());
        log.info("Difficulty: {}", request.getDifficulty());

        try {
            // 1. Validate user exists
            Account account = accountRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

            // 2. Set default question types if not provided
            if (request.getQuestionTypes() == null || request.getQuestionTypes().isEmpty()) {
                request.setQuestionTypes(List.of("DEFINITION", "VOCABULARY", "FILL_BLANK"));
            }

            // 3. Set user_id in request
            request.setUserId(userId.toString());

            // 4. Call AI API to generate flashcards
            log.info("Calling AI Flashcard API at: {}", aiFlashCardConfig.getApiUrl());
            AiFlashCardResponse aiResponse = callAiFlashCardApi(request);

            if (aiResponse == null || !"success".equalsIgnoreCase(aiResponse.getStatus())) {
                throw new RuntimeException("AI Flashcard generation failed");
            }

            log.info("AI API returned {} flashcards", aiResponse.getTotalCards());

            // 5. Extract deck title from PDF URL
            String deckTitle = extractTitleFromPdfUrl(aiResponse.getDocument().getPdfUrl());
            log.info("Extracted deck title: {}", deckTitle);

            // 6. Create Deck
            Deck deck = Deck.builder()
                    .account(account)
                    .title(deckTitle)
                    .description("Generated from PDF using AI")
                    .learnerNumber(0)
                    .isPublic(true)
                    .password(null)
                    .cards(new ArrayList<>())
                    .build();

            deck = deckRepository.save(deck);
            log.info("Created deck with ID: {}", deck.getId());

            // 7. Create Cards from AI response
            List<Card> cards = new ArrayList<>();
            for (AiFlashCardResponse.Flashcard flashcard : aiResponse.getFlashcards()) {
                Card card = Card.builder()
                        .deck(deck)
                        .front(flashcard.getQuestion())
                        .back(flashcard.getAnswer())
                        .build();
                cards.add(card);
            }

            // 8. Save all cards
            cards = cardRepository.saveAll(cards);
            log.info("Created {} cards", cards.size());

            // 9. Set cards to deck
            deck.setCards(cards);

            // 10. Build response
            DeckResponse response = modelMapper.map(deck, DeckResponse.class);
            response.setAuthorName(account.getName());
            response.setAuthorId(account.getId());

            // Map cards to CardDto
            List<CardDto> cardDtos = cards.stream()
                    .map(card -> CardDto.builder()
                            .id(card.getId())
                            .front(card.getFront())
                            .back(card.getBack())
                            .build())
                    .collect(Collectors.toList());

            response.setCards(cardDtos);

            log.info("========== GENERATE FLASHCARDS AND CREATE DECK END ==========\n");
            return response;

        } catch (Exception e) {
            log.error("Failed to generate flashcards and create deck: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate flashcards and create deck", e);
        }
    }

    /**
     * Call AI Flashcard API with API Key authentication
     */
    private AiFlashCardResponse callAiFlashCardApi(AiFlashCardRequest request) {
        try {
            // ✅ THÊM API KEY VÀO HEADERS
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-api-key", aiFlashCardConfig.getApiKey());  // Hoặc "Authorization", "Bearer " + apiKey tùy API

            // Debug logging
            log.debug("API URL: {}", aiFlashCardConfig.getApiUrl());
            log.debug("API Key (first 10 chars): {}...",
                    aiFlashCardConfig.getApiKey() != null ?
                            aiFlashCardConfig.getApiKey().substring(0, Math.min(10, aiFlashCardConfig.getApiKey().length())) : "NULL");

            HttpEntity<AiFlashCardRequest> entity = new HttpEntity<>(request, headers);

            log.info("Calling AI Flashcard API...");
            ResponseEntity<AiFlashCardResponse> response = restTemplate.exchange(
                    aiFlashCardConfig.getApiUrl(),
                    HttpMethod.POST,
                    entity,
                    AiFlashCardResponse.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                log.info("AI Flashcard API call successful. Status: {}", response.getStatusCode());
                return response.getBody();
            } else {
                log.error("AI API returned status: {}", response.getStatusCode());
                throw new RuntimeException("AI API call failed with status: " + response.getStatusCode());
            }

        } catch (Exception e) {
            log.error("Error calling AI Flashcard API: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to call AI Flashcard API", e);
        }
    }

    /**
     * Extract title from PDF URL
     * Example: "s3://bucket/uploads/RAG.pdf" -> "RAG"
     */
    private String extractTitleFromPdfUrl(String pdfUrl) {
        if (pdfUrl == null || pdfUrl.isEmpty()) {
            return "Untitled Deck";
        }

        try {
            // Get the last part after the last '/'
            String fileName = pdfUrl.substring(pdfUrl.lastIndexOf('/') + 1);

            // Remove .pdf extension
            if (fileName.toLowerCase().endsWith(".pdf")) {
                fileName = fileName.substring(0, fileName.length() - 4);
            }

            return fileName;
        } catch (Exception e) {
            log.error("Error extracting title from PDF URL: {}", e.getMessage());
            return "Untitled Deck";
        }
    }

    /**
     * Sanitize file name to avoid special characters
     */
    private String sanitizeFileName(String fileName) {
        if (fileName == null) {
            return "document.pdf";
        }
        // Keep only letters, numbers, dots, hyphens, and underscores
        return fileName.replaceAll("[^a-zA-Z0-9.\\-_]", "_");
    }
}