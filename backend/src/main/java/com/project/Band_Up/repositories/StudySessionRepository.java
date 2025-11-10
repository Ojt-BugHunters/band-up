package com.project.Band_Up.repositories;

import com.project.Band_Up.entities.StudySession;
import org.springframework.data.jpa.repository.JpaRepository;
<<<<<<< Updated upstream

import java.util.UUID;

public interface StudySessionRepository extends JpaRepository<StudySession, UUID> {
=======
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface StudySessionRepository extends JpaRepository<StudySession, UUID> {

>>>>>>> Stashed changes
}
