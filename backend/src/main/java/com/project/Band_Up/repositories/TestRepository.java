package com.project.Band_Up.repositories;

import com.project.Band_Up.entities.Test;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TestRepository extends JpaRepository<Test, UUID> {

    // 1. Lấy tất cả Test theo thứ tự ngày tạo
    List<Test> findAllByOrderByCreateAtDesc();

    // 2. Lấy tất cả Test theo skillName
    List<Test> findBySkillName(String skillName);

    // 3. Tìm kiếm Test theo title
    List<Test> findByTitleContainingIgnoreCase(String keyword);

    // 4. Lấy tất cả Test của một user
    List<Test> findByUser_Id(UUID userId);


}
