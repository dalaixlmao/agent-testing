package com.scalable.todo.controller;

import com.scalable.todo.dto.CategoryDto;
import com.scalable.todo.service.CategoryService;
import io.micrometer.core.annotation.Timed;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@Slf4j
public class CategoryController {

    private final CategoryService categoryService;
    
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Timed(value = "categories.create", description = "Time taken to create a new category")
    public ResponseEntity<CategoryDto> createCategory(@Valid @RequestBody CategoryDto categoryDto) {
        log.info("REST request to create a new category");
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.createCategory(categoryDto));
    }
    
    @PutMapping("/{id}")
    @Timed(value = "categories.update", description = "Time taken to update a category")
    public ResponseEntity<CategoryDto> updateCategory(
            @PathVariable UUID id, 
            @Valid @RequestBody CategoryDto categoryDto) {
        log.info("REST request to update category with id: {}", id);
        return ResponseEntity.ok(categoryService.updateCategory(id, categoryDto));
    }
    
    @GetMapping("/{id}")
    @Timed(value = "categories.get", description = "Time taken to get a category by ID")
    public ResponseEntity<CategoryDto> getCategory(
            @PathVariable UUID id,
            @RequestHeader("X-User-ID") UUID userId) {
        log.info("REST request to get category with id: {}", id);
        return ResponseEntity.ok(categoryService.getCategoryById(id, userId));
    }
    
    @GetMapping("/user")
    @Timed(value = "categories.list", description = "Time taken to list categories")
    public ResponseEntity<List<CategoryDto>> getUserCategories(@RequestHeader("X-User-ID") UUID userId) {
        log.info("REST request to get all categories for user: {}", userId);
        return ResponseEntity.ok(categoryService.getUserCategories(userId));
    }
    
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Timed(value = "categories.delete", description = "Time taken to delete a category")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable UUID id,
            @RequestHeader("X-User-ID") UUID userId) {
        log.info("REST request to delete category with id: {}", id);
        categoryService.deleteCategory(id, userId);
        return ResponseEntity.noContent().build();
    }
}