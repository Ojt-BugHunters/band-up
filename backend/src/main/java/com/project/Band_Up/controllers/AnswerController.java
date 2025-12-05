package com.project.Band_Up.controllers;

import com.project.Band_Up.dtos.answer.AnswerCreateRequest;
import com.project.Band_Up.dtos.answer.DictationAnswerResponse;
import com.project.Band_Up.dtos.answer.IeltsAnswerResponse;
import com.project.Band_Up.dtos.attempt.TestResultResponseDTO;
//import com.project.Band_Up.services.answer.DictationAnswerServiceImpl;
import com.project.Band_Up.services.answer.AbstractAnswerServiceImpl;
import com.project.Band_Up.services.answer.IeltsAnswerServiceImpl;
import com.project.Band_Up.utils.JwtUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/answers")
@RequiredArgsConstructor
@Tag(name = "Answer API", description = "Manage answers for the candidates, including Dictation scoring, Ielts scoring, retrieving results, and deleting answers.")
public class    AnswerController {

//    private final DictationAnswerServiceImpl dictationAnswerService;
    private final IeltsAnswerServiceImpl ieltsAnswerService;
    private final AbstractAnswerServiceImpl abstractAnswerService;

    // ==========================================================
    // 🟢 GET - Get the result of a Dictation answer based on attemptSectionId + questionId
    // ==========================================================
//    @Operation(
//            summary = "Get the result of the candidate's answer (Dictation)",
//            description = "Returns the detailed information about the answer, correct/incorrect status, mistakes, and creation time.",
//            parameters = {
//                    @Parameter(name = "attemptSectionId", description = "ID of the attempt section", required = true),
//                    @Parameter(name = "questionId", description = "ID of the question", required = true)
//            },
//            responses = {
//                    @ApiResponse(responseCode = "200", description = "Successfully retrieved the result",
//                            content = @Content(mediaType = "application/json",
//                                    schema = @Schema(implementation = DictationAnswerResponse.class))),
//                    @ApiResponse(responseCode = "404", description = "Answer not found for the given attemptSectionId/questionId")
//            }
//    )
//    @GetMapping("/dictation/{attemptSectionId}/{questionId}")
//    public ResponseEntity<DictationAnswerResponse> getDictationAnswerByAttemptAndQuestion(
//            @PathVariable UUID attemptSectionId,
//            @PathVariable UUID questionId
//    ) {
//        return ResponseEntity.ok(dictationAnswerService.getAnswerByAttemptSectionIdAndQuestionId(attemptSectionId, questionId));
//    }

//     ==========================================================
//     🟡 POST - Submit Dictation answer for scoring
//     ==========================================================
//    @Operation(
//            summary = "Submit Dictation answer for scoring",
//            description = "Receive the user's answer (answerContent), compare it with the correct answer (script in Question), score it, identify mistakes, and store it in the database.",
//            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
//                    description = "User's text answer",
//                    required = true,
//                    content = @Content(schema = @Schema(implementation = AnswerCreateRequest.class))
//            ),
//            responses = {
//                    @ApiResponse(responseCode = "200", description = "Scoring successful",
//                            content = @Content(mediaType = "application/json",
//                                    schema = @Schema(implementation = DictationAnswerResponse.class))),
//                    @ApiResponse(responseCode = "400", description = "Invalid data"),
//                    @ApiResponse(responseCode = "404", description = "AttemptSection or Question not found")
//            }
//    )
//    @PostMapping("/dictation/{attemptSectionId}/{questionId}")
//    public ResponseEntity<DictationAnswerResponse> submitDictationAnswer(
//            @PathVariable UUID attemptSectionId,
//            @PathVariable UUID questionId,
//            @RequestBody AnswerCreateRequest request
//    ) {
//        return ResponseEntity.ok(dictationAnswerService.submitAnswer(attemptSectionId, questionId, request));
//    }



    // ==========================================================
    // 🟡 POST - Submit Ielts answers for the entire test
    // ==========================================================
    @Operation(
            summary = "Submit Ielts answers for the entire test",
            description = "Score the entire test based on the questions in the test.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "User's answers for the test",
                    required = true,
                    content = @Content(schema = @Schema(implementation = AnswerCreateRequest.class))
            ),
            responses = {
                    @ApiResponse(responseCode = "200", description = "Scoring successful",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = IeltsAnswerResponse.class))),
                    @ApiResponse(responseCode = "400", description = "Invalid data"),
                    @ApiResponse(responseCode = "404", description = "Test or corresponding questions not found")
            }
    )
    @PostMapping("/ielts/test/{attemptId}")
    public ResponseEntity<TestResultResponseDTO> submitIeltsAnswerForTest(
            @PathVariable UUID attemptId,
            @RequestBody AnswerCreateRequest request,
            @AuthenticationPrincipal JwtUserDetails userDetails
    ) {
        TestResultResponseDTO responses = ieltsAnswerService.submitIeltsAnswerForTest(attemptId, request, userDetails.getAccountId());
        return ResponseEntity.ok(responses);
    }

    // ==========================================================
    // 🔴 DELETE - Delete an answer for a specific question
    // ==========================================================
    @Operation(
            summary = "Delete an answer",
            description = "Delete the answer for a specific question in an attempt section (for admin or when the user needs to redo the question).",
            parameters = {
                    @Parameter(name = "attemptSectionId", description = "ID of the attempt section", required = true),
                    @Parameter(name = "questionId", description = "ID of the question", required = true)
            },
            responses = {
                    @ApiResponse(responseCode = "204", description = "Deleted successfully"),
                    @ApiResponse(responseCode = "404", description = "Answer not found")
            }
    )
    @DeleteMapping("/{attemptSectionId}/{questionId}")
    public ResponseEntity<Void> deleteAnswer(
            @PathVariable UUID attemptSectionId,
            @PathVariable UUID questionId
    ) {
        abstractAnswerService.deleteAnswer(attemptSectionId, questionId);
        return ResponseEntity.noContent().build();
    }
}

