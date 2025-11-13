package com.project.Band_Up.repositories;

import com.project.Band_Up.entities.StudyInterval;
import com.project.Band_Up.entities.StudySession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
@Repository
public interface StudyIntervalRepository extends JpaRepository<StudyInterval, UUID> {
    List<StudyInterval> findByStudySessionOrderByOrderIndexAsc(StudySession studySession);
}
