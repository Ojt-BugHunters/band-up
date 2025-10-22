package com.project.Band_Up.entities;

import com.project.Band_Up.enums.ReactType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BlogReact {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "blog_post_id")
    private BlogPost blogPost;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "account_id")
    private Account reactAuthor;

    @Enumerated(EnumType.STRING)
    private ReactType reactType;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
