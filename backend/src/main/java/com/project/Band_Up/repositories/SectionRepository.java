package com.project.Band_Up.repositories;

import com.project.Band_Up.entities.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SectionRepository extends JpaRepository<Section, UUID> {
    // Lấy tất cả Section theo title
    List<Section> findAllByTitle( String title);
    // Lấy tất cả Section theo TestId, order by orderIndex ASC
    List<Section> findAllByTest_IdOrderByOrderIndexAsc(UUID testId);


}
