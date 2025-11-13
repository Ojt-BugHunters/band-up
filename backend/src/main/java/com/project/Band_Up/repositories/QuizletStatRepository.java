package com.project.Band_Up.repositories;

import com.project.Band_Up.entities.QuizletStat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface QuizletStatRepository extends JpaRepository<QuizletStat, UUID> {
}
