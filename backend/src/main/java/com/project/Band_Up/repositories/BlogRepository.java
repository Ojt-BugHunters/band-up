package com.project.Band_Up.repositories;

import com.project.Band_Up.entities.BlogPost;
import com.project.Band_Up.entities.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BlogRepository  extends JpaRepository<BlogPost, UUID> {
    Page<BlogPost> findByTitleContainingIgnoreCaseAndTags(String title, List<Tag> tags, Pageable pageable);

    Page<BlogPost> findByTags(List<Tag> tags, Pageable pageable);

    Page<BlogPost> findByTitleContainingIgnoreCase(String title, Pageable pageable);
}
