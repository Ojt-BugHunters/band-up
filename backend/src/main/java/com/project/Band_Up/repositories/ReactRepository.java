package com.project.Band_Up.repositories;

import com.project.Band_Up.entities.Account;
import com.project.Band_Up.entities.BlogPost;
import com.project.Band_Up.entities.BlogReact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReactRepository extends JpaRepository<BlogReact, UUID> {
    Optional<BlogReact> findByBlogPostAndReactAuthor(BlogPost blogPost, Account account);
}
