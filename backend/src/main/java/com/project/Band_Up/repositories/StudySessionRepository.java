package com.project.Band_Up.repositories;

import com.project.Band_Up.entities.StudySession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface StudySessionRepository extends JpaRepository<StudySession, UUID> {
}
