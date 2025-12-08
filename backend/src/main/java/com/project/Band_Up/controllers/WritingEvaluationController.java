package com.project.Band_Up.controllers;

import com.project.Band_Up.dtos.aiWriting.AiWritingResponse;
import com.project.Band_Up.dtos.aiWriting.AiWritingScoreRequest;
import com.project.Band_Up.dtos.attempt.AttemptAiEvaluationsResponse;
import com.project.Band_Up.services.aiEvaluation.WritingAiEvaluationService;
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
@RequestMapping("/api/v1/evaluations/writing")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Writing AI Evaluation API", description = "AI-powered writing evaluation endpoints")
public class WritingEvaluationController {

    private final WritingAiEvaluationService writingAiEvaluationService;

    // ==========================================================
    // 🟡 POST - Chấm 1 bài writing cụ thể
    // ==========================================================
    @Operation(
            summary = "Evaluate writing and save to database",
            description = "Submit an essay for AI evaluation and save results",
            parameters = {
                    @Parameter(name = "answerId", description = "ID of the answer to evaluate", required = true)
            },
            responses = {
                    @ApiResponse(responseCode = "200", description = "Evaluation successful",
                            content = @Content(schema = @Schema(implementation = AiWritingResponse.class))),
                    @ApiResponse(responseCode = "404", description = "Answer not found"),
                    @ApiResponse(responseCode = "500", description = "AI API error")
            }
    )
    @PostMapping("/evaluate/{answerId}")
    public ResponseEntity<AiWritingResponse> evaluateWriting(
            @PathVariable UUID answerId,
            @RequestBody AiWritingScoreRequest request) {

        log.info("Received writing evaluation request for answer ID: {}", answerId);
        AiWritingResponse response = writingAiEvaluationService.evaluateAndSave(request, answerId);
        return ResponseEntity.ok(response);
    }

    // ==========================================================
    // 🟢 GET - Xem kết quả chấm của 1 answer
    // ==========================================================
//    @Operation(
//            summary = "Get evaluation by answer ID",
//            description = "Retrieve stored AI evaluation for a specific answer",
//            parameters = {
//                    @Parameter(name = "answerId", description = "ID of the answer", required = true)
//            },
//            responses = {
//                    @ApiResponse(responseCode = "200", description = "Successfully retrieved evaluation",
//                            content = @Content(schema = @Schema(implementation = AiWritingResponse.class))),
//                    @ApiResponse(responseCode = "404", description = "Evaluation not found")
//            }
//    )
//    @GetMapping("/answer/{answerId}")
//    public ResponseEntity<AiWritingResponse> getEvaluationByAnswerId(@PathVariable UUID answerId) {
//        log.info("Getting evaluation for answer ID: {}", answerId);
//        AiWritingResponse response = writingAiEvaluationService.getEvaluationByAnswerId(answerId);
//        return ResponseEntity.ok(response);
//    }

    // ==========================================================
    // 🟢 GET - Xem lịch sử attempt với AI evaluations (cho trang history)
    // ==========================================================
    @Operation(
            summary = "Get attempt detail with AI evaluations for history page",
            description = "Retrieve complete attempt details including test info, sections, answers, and AI evaluation results. " +
                    "This is used for displaying test history with AI feedback on the frontend.",
            parameters = {
                    @Parameter(name = "attemptId", description = "ID of the attempt to view", required = true)
            },
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Successfully retrieved attempt details with AI evaluations",
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

        log.info("Getting attempt detail with AI evaluations for attempt ID: {} by user: {}",
                attemptId, userDetails.getAccountId());

        AttemptAiEvaluationsResponse response = writingAiEvaluationService.getAllEvaluationsByAttemptId(
                attemptId,
                userDetails.getAccountId()
        );

        return ResponseEntity.ok(response);
    }
}