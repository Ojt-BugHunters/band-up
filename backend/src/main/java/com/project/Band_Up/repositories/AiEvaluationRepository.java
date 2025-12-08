package com.project.Band_Up.repositories;

import com.project.Band_Up.entities.AiEvaluation;
import com.project.Band_Up.entities.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AiEvaluationRepository extends JpaRepository<AiEvaluation, UUID> {

    /**
     * Find AI evaluation by answer
     *
     * @param answer The answer entity
     * @return Optional containing the AI evaluation if found
     */
    Optional<AiEvaluation> findByAnswer(Answer answer);

    /**
     * Find AI evaluation by answer ID
     *
     * @param answerId The answer ID
     * @return Optional containing the AI evaluation if found
     */
    Optional<AiEvaluation> findByAnswerId(UUID answerId);

    /**
     * Check if AI evaluation exists for an answer
     *
     * @param answer The answer entity
     * @return true if evaluation exists, false otherwise
     */
    boolean existsByAnswer(Answer answer);

    /**
     * Find all AI evaluations by attempt ID
     * Join through Answer -> AttemptSection -> Attempt
     *
     * @param attemptId The attempt ID
     * @return List of AI evaluations for the attempt
     */
    @Query("SELECT ae FROM AiEvaluation ae " +
            "JOIN ae.answer a " +
            "JOIN a.attemptSection ats " +
            "JOIN ats.attempt att " +
            "WHERE att.id = :attemptId")
    List<AiEvaluation> findAllByAttemptId(@Param("attemptId") UUID attemptId);
}