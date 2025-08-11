package com.scalable.todo.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "todos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Todo {

    @Id
    @GeneratedValue
    private UUID id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(length = 1000)
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TodoStatus status;
    
    @Column(nullable = false)
    private int priority;
    
    @Column(name = "due_date")
    private LocalDateTime dueDate;
    
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    
    @Column(name = "category_id")
    private UUID categoryId;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    @Version
    private int version;
    
    public enum TodoStatus {
        PENDING,
        IN_PROGRESS,
        COMPLETED,
        ARCHIVED
    }
}