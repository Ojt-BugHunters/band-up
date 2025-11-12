package com.project.Band_Up.repositories;

import com.project.Band_Up.entities.Media;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
@Repository
public interface MediaRepository extends JpaRepository<Media, UUID> {
    // Lấy tất cả media theo sectionId
    List<Media> findAllBySection_Id(UUID sectionId);
    Optional<Media> findFirstByQuestion_Id(UUID questionId);
}
