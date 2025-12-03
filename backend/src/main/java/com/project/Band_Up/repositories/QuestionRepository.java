package com.project.Band_Up.repositories;

import com.project.Band_Up.entities.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuestionRepository extends JpaRepository<Question, UUID> {
    // Lấy tất cả Question theo SectionId
    List<Question> findAllBySection_Id(UUID sectionId);
}
