package com.project.Band_Up.repositories;

import com.project.Band_Up.entities.BlogPost;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface BlogRepository  extends JpaRepository<BlogPost, UUID> {
}
