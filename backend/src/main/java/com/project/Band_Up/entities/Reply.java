package com.project.Band_Up.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "reply")
public class Reply {
    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.TIME)
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn (name = "user_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_reply_user"))
    private Account user ;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn (name= "comment_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_reply_comment"))
    private Comment comment ;
    @NotNull
    private String content ;
    @CreationTimestamp
    @Column(name = "create_at", nullable = false, updatable = false)
    private LocalDateTime createAt;
}
