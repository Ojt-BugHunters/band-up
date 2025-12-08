package com.project.Band_Up.repositories;

import com.project.Band_Up.entities.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
@Repository
public interface AnswerRepository extends JpaRepository<Answer, UUID> {
    // Lấy ra answer theo attemptSection và questionId
    Answer findByAttemptSection_IdAndQuestion_Id(UUID attemptSectionId, UUID questionId);
    List<Answer> findByAttemptSectionId(UUID attemptSectionId);
    Answer findByAttemptSection_Id(UUID attemptSectionId);
}
