package com.project.Band_Up.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "comment")
public class Comment {

    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.TIME)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn (name = "user_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_comment_user"))
    private Account user ;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn (name= "test_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_comment_test"))
    private Test test ;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "blog_post_id")
    private BlogPost blogPost;

    @NotNull
    private String content ;

    @CreationTimestamp
    @Column(name = "create_at", nullable = false, updatable = false)
    private LocalDateTime createAt;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Reply> replies;
}
