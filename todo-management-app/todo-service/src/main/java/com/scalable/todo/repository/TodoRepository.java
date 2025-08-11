package com.scalable.todo.repository;

import com.scalable.todo.entity.Todo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TodoRepository extends JpaRepository<Todo, UUID>, JpaSpecificationExecutor<Todo> {

    Page<Todo> findByUserId(UUID userId, Pageable pageable);
    
    Page<Todo> findByUserIdAndStatus(UUID userId, Todo.TodoStatus status, Pageable pageable);
    
    Page<Todo> findByUserIdAndCategoryId(UUID userId, UUID categoryId, Pageable pageable);
    
    @Query("SELECT t FROM Todo t WHERE t.userId = :userId AND t.dueDate < :now AND t.status != com.scalable.todo.entity.Todo.TodoStatus.COMPLETED")
    List<Todo> findOverdueTodos(@Param("userId") UUID userId, @Param("now") LocalDateTime now);
    
    @Query("SELECT t FROM Todo t WHERE t.userId = :userId AND t.dueDate BETWEEN :start AND :end")
    List<Todo> findTodosDueInDateRange(@Param("userId") UUID userId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    Optional<Todo> findByIdAndUserId(UUID id, UUID userId);
    
    @Query(value = "SELECT * FROM todos WHERE user_id = :userId AND to_tsvector('english', title || ' ' || description) @@ plainto_tsquery('english', :searchTerm)",
           countQuery = "SELECT count(*) FROM todos WHERE user_id = :userId AND to_tsvector('english', title || ' ' || description) @@ plainto_tsquery('english', :searchTerm)",
           nativeQuery = true)
    Page<Todo> searchTodos(@Param("userId") UUID userId, @Param("searchTerm") String searchTerm, Pageable pageable);
}