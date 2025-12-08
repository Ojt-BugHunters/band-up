package com.project.Band_Up.controllers;

import com.project.Band_Up.dtos.aiWriting.AiWritingResponse;
import com.project.Band_Up.dtos.aiWriting.AiWritingScoreRequest;
import com.project.Band_Up.services.aiEvaluation.WritingAiEvaluationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/evaluations/writing")
@RequiredArgsConstructor
@Slf4j
public class WritingEvaluationController {

    private final WritingAiEvaluationService writingAiEvaluationService;

    @PostMapping("/evaluate/{answerId}")
    public ResponseEntity<AiWritingResponse> evaluateWriting(
            @PathVariable UUID answerId,
            @RequestBody AiWritingScoreRequest request) {

        log.info("Received writing evaluation request for answer ID: {}", answerId);

        AiWritingResponse response = writingAiEvaluationService.evaluateAndSave(request, answerId);

        return ResponseEntity.ok(response);
    }
}