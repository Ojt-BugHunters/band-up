package com.project.Band_Up.repositories;

import com.project.Band_Up.entities.AttemptSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
@Repository
public interface AttemptSectionRepository extends JpaRepository<AttemptSection, UUID> {
    // lấy  attemptSection theo attemptId và sectionId
    AttemptSection findByAttempt_IdAndSection_Id(UUID attemptId, UUID sectionId);
    // lấy tất cả attemptSection theo attemptId sắp xếp theo startAt mới nhất
    List<AttemptSection> findAllByAttempt_IdOrderByStartAtDesc(UUID attemptId);


}
