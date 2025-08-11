package com.scalable.todo.service.impl;

import com.scalable.todo.dto.CategoryDto;
import com.scalable.todo.entity.Category;
import com.scalable.todo.exception.DuplicateResourceException;
import com.scalable.todo.exception.ResourceNotFoundException;
import com.scalable.todo.mapper.CategoryMapper;
import com.scalable.todo.repository.CategoryRepository;
import com.scalable.todo.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    @CacheEvict(value = "userCategories", key = "#categoryDto.userId")
    public CategoryDto createCategory(CategoryDto categoryDto) {
        log.info("Creating a new category with name: {}", categoryDto.getName());
        
        if (categoryRepository.existsByNameAndUserId(categoryDto.getName(), categoryDto.getUserId())) {
            throw new DuplicateResourceException("Category", "name", categoryDto.getName());
        }
        
        Category category = categoryMapper.toEntity(categoryDto);
        Category savedCategory = categoryRepository.save(category);
        return categoryMapper.toDto(savedCategory);
    }

    @Override
    @Caching(evict = {
        @CacheEvict(value = "categories", key = "#id.toString().concat('-').concat(#categoryDto.userId)"),
        @CacheEvict(value = "userCategories", key = "#categoryDto.userId")
    })
    public CategoryDto updateCategory(UUID id, CategoryDto categoryDto) {
        log.info("Updating category with id: {}", id);
        Category category = categoryRepository.findByIdAndUserId(id, categoryDto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        
        // Check if updated name conflicts with an existing category
        if (!category.getName().equals(categoryDto.getName()) && 
            categoryRepository.existsByNameAndUserId(categoryDto.getName(), categoryDto.getUserId())) {
            throw new DuplicateResourceException("Category", "name", categoryDto.getName());
        }
        
        categoryMapper.updateEntityFromDto(categoryDto, category);
        Category updatedCategory = categoryRepository.save(category);
        return categoryMapper.toDto(updatedCategory);
    }

    @Override
    @Cacheable(value = "categories", key = "#id.toString().concat('-').concat(#userId)")
    @Transactional(readOnly = true)
    public CategoryDto getCategoryById(UUID id, UUID userId) {
        log.info("Fetching category with id: {} for user: {}", id, userId);
        Category category = categoryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        return categoryMapper.toDto(category);
    }

    @Override
    @Cacheable(value = "userCategories", key = "#userId")
    @Transactional(readOnly = true)
    public List<CategoryDto> getUserCategories(UUID userId) {
        log.info("Fetching all categories for user: {}", userId);
        List<Category> categories = categoryRepository.findByUserId(userId);
        return categories.stream()
                .map(categoryMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Caching(evict = {
        @CacheEvict(value = "categories", key = "#id.toString().concat('-').concat(#userId)"),
        @CacheEvict(value = "userCategories", key = "#userId")
    })
    public void deleteCategory(UUID id, UUID userId) {
        log.info("Deleting category with id: {} for user: {}", id, userId);
        Category category = categoryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        categoryRepository.delete(category);
    }
}