package com.project.Band_Up.controllers;

import com.project.Band_Up.dtos.aiSpeaking.AiSpeakingRequest;
import com.project.Band_Up.dtos.aiSpeaking.AiSpeakingResponse;
import com.project.Band_Up.dtos.attempt.AttemptAiEvaluationsResponse;
import com.project.Band_Up.services.aiEvaluation.SpeakingAiEvaluationService;
import com.project.Band_Up.utils.JwtUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/evaluations/speaking")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Speaking AI Evaluation API", description = "AI-powered speaking evaluation endpoints")
public class SpeakingEvaluationController {

    private final SpeakingAiEvaluationService speakingAiEvaluationService;

    // ==========================================================
    // 🟡 POST - Chấm speaking bằng AI
    // ==========================================================
    @Operation(
            summary = "Evaluate speaking and save to database",
            description = "Submit an audio recording for AI evaluation and save results. " +
                    "Audio URL is taken from the Answer entity's s3AudioUrl field.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Evaluation successful",
                            content = @Content(schema = @Schema(implementation = AiSpeakingResponse.class))),
                    @ApiResponse(responseCode = "404", description = "Answer not found"),
                    @ApiResponse(responseCode = "400", description = "Audio URL not found in answer"),
                    @ApiResponse(responseCode = "500", description = "AI API error")
            }
    )
    @PostMapping("/evaluate/{answerId}")
    public ResponseEntity<AiSpeakingResponse> evaluateSpeaking(
            @RequestBody AiSpeakingRequest request,
            @PathVariable UUID answerId) {

        AiSpeakingResponse response = speakingAiEvaluationService.evaluateAndSave(
                answerId, request
        );

        return ResponseEntity.ok(response);
    }

    // ==========================================================
    // 🟢 GET - Xem kết quả chấm của 1 answer
    // ==========================================================
    @Operation(
            summary = "Get evaluation by answer ID",
            description = "Retrieve stored AI speaking evaluation for a specific answer",
            parameters = {
                    @Parameter(name = "answerId", description = "ID of the answer", required = true)
            },
            responses = {
                    @ApiResponse(responseCode = "200", description = "Successfully retrieved evaluation",
                            content = @Content(schema = @Schema(implementation = AiSpeakingResponse.class))),
                    @ApiResponse(responseCode = "404", description = "Evaluation not found")
            }
    )
    @GetMapping("/answer/{answerId}")
    public ResponseEntity<AiSpeakingResponse> getEvaluationByAnswerId(@PathVariable UUID answerId) {

        log.info("Getting speaking evaluation for answer ID: {}", answerId);

        AiSpeakingResponse response = speakingAiEvaluationService.getEvaluationByAnswerId(answerId);

        return ResponseEntity.ok(response);
    }

    // ==========================================================
    // 🟢 GET - Xem lịch sử attempt với AI evaluations (cho trang history)
    // ==========================================================
    @Operation(
            summary = "Get attempt detail with AI speaking evaluations for history page",
            description = "Retrieve complete attempt details including test info, sections, audio recordings, and AI evaluation results. " +
                    "This is used for displaying speaking test history with AI feedback on the frontend.",
            parameters = {
                    @Parameter(name = "attemptId", description = "ID of the attempt to view", required = true)
            },
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Successfully retrieved attempt details with AI speaking evaluations",
                            content = @Content(schema = @Schema(implementation = AttemptAiEvaluationsResponse.class))
                    ),
                    @ApiResponse(responseCode = "403", description = "User does not own this attempt"),
                    @ApiResponse(responseCode = "404", description = "Attempt not found"),
                    @ApiResponse(responseCode = "400", description = "Attempt not submitted yet")
            }
    )
    @GetMapping("/attempts/{attemptId}/detail")
    public ResponseEntity<AttemptAiEvaluationsResponse> getAttemptDetailWithEvaluations(
            @PathVariable UUID attemptId,
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        log.info("Getting attempt detail with AI speaking evaluations for attempt ID: {} by user: {}",
                attemptId, userDetails.getAccountId());

        AttemptAiEvaluationsResponse response = speakingAiEvaluationService.getAllEvaluationsByAttemptId(
                attemptId,
                userDetails.getAccountId()
        );

        return ResponseEntity.ok(response);
    }
}