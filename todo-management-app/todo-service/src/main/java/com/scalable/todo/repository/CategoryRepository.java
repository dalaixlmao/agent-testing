package com.scalable.todo.repository;

import com.scalable.todo.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    
    List<Category> findByUserId(UUID userId);
    
    Optional<Category> findByIdAndUserId(UUID id, UUID userId);
    
    boolean existsByNameAndUserId(String name, UUID userId);
}