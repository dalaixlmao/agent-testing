package com.scalable.todo.service;

import com.scalable.todo.dto.CategoryDto;

import java.util.List;
import java.util.UUID;

public interface CategoryService {
    
    CategoryDto createCategory(CategoryDto categoryDto);
    
    CategoryDto updateCategory(UUID id, CategoryDto categoryDto);
    
    CategoryDto getCategoryById(UUID id, UUID userId);
    
    List<CategoryDto> getUserCategories(UUID userId);
    
    void deleteCategory(UUID id, UUID userId);
}