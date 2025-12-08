package com.project.Band_Up.repositories;

import com.project.Band_Up.entities.AiEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AiEvaluationRepository extends JpaRepository<AiEvaluation, UUID> {
}
