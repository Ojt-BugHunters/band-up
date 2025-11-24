package com.project.Band_Up.repositories;

import com.project.Band_Up.entities.Attempt;
import com.project.Band_Up.enums.Status;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AttemptRepository extends JpaRepository<Attempt, UUID> {
    // Lấy Attempt theo userId sắp xếp theo startAt mới nhất
    List<Attempt> findAllByUser_IdOrderByStartAtDesc(UUID userId);
    // Lấy Attempt theo userId theo status sắp xếp theo startAt mới nhất
    List<Attempt> findAllByUser_IdAndStatusOrderByStartAtDesc(UUID userId, Status status);
    // Lấy Attempt userId và testId sắp xếp theo startAt mới nhất
    List<Attempt> findAllByUser_IdAndTest_IdOrderByStartAtDesc(UUID userId, UUID testId);


}
