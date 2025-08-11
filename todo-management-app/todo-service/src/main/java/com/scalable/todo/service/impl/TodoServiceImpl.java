package com.scalable.todo.service.impl;

import com.scalable.todo.dto.PagedResponseDto;
import com.scalable.todo.dto.TodoDto;
import com.scalable.todo.entity.Todo;
import com.scalable.todo.exception.ResourceNotFoundException;
import com.scalable.todo.mapper.TodoMapper;
import com.scalable.todo.repository.TodoRepository;
import com.scalable.todo.service.TodoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TodoServiceImpl implements TodoService {

    private final TodoRepository todoRepository;
    private final TodoMapper todoMapper;

    @Override
    public TodoDto createTodo(TodoDto todoDto) {
        log.info("Creating a new todo with title: {}", todoDto.getTitle());
        Todo todo = todoMapper.toEntity(todoDto);
        Todo savedTodo = todoRepository.save(todo);
        return todoMapper.toDto(savedTodo);
    }

    @Override
    @CacheEvict(value = "todos", key = "#id.toString().concat('-').concat(#todoDto.userId)")
    public TodoDto updateTodo(UUID id, TodoDto todoDto) {
        log.info("Updating todo with id: {}", id);
        Todo todo = todoRepository.findByIdAndUserId(id, todoDto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Todo", "id", id));
        
        todoMapper.updateEntityFromDto(todoDto, todo);
        Todo updatedTodo = todoRepository.save(todo);
        return todoMapper.toDto(updatedTodo);
    }

    @Override
    @Cacheable(value = "todos", key = "#id.toString().concat('-').concat(#userId)")
    @Transactional(readOnly = true)
    public TodoDto getTodoById(UUID id, UUID userId) {
        log.info("Fetching todo with id: {} for user: {}", id, userId);
        Todo todo = todoRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Todo", "id", id));
        return todoMapper.toDto(todo);
    }

    @Override
    @CacheEvict(value = "todos", key = "#id.toString().concat('-').concat(#userId)")
    public void deleteTodo(UUID id, UUID userId) {
        log.info("Deleting todo with id: {} for user: {}", id, userId);
        Todo todo = todoRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Todo", "id", id));
        todoRepository.delete(todo);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponseDto<TodoDto> getUserTodos(UUID userId, Integer page, Integer size, String sortBy, String sortDir) {
        log.info("Fetching todos for user: {} with pagination", userId);
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : 
                Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Todo> todoPage = todoRepository.findByUserId(userId, pageable);
        
        return createPagedResponse(todoPage);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponseDto<TodoDto> getUserTodosByStatus(UUID userId, Todo.TodoStatus status, Integer page, Integer size, String sortBy, String sortDir) {
        log.info("Fetching todos for user: {} with status: {}", userId, status);
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : 
                Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Todo> todoPage = todoRepository.findByUserIdAndStatus(userId, status, pageable);
        
        return createPagedResponse(todoPage);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponseDto<TodoDto> getUserTodosByCategory(UUID userId, UUID categoryId, Integer page, Integer size, String sortBy, String sortDir) {
        log.info("Fetching todos for user: {} with category: {}", userId, categoryId);
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : 
                Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Todo> todoPage = todoRepository.findByUserIdAndCategoryId(userId, categoryId, pageable);
        
        return createPagedResponse(todoPage);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TodoDto> getOverdueTodos(UUID userId) {
        log.info("Fetching overdue todos for user: {}", userId);
        List<Todo> overdueTodos = todoRepository.findOverdueTodos(userId, LocalDateTime.now());
        return overdueTodos.stream()
                .map(todoMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TodoDto> getTodosDueInDateRange(UUID userId, LocalDateTime start, LocalDateTime end) {
        log.info("Fetching todos due between {} and {} for user: {}", start, end, userId);
        List<Todo> todos = todoRepository.findTodosDueInDateRange(userId, start, end);
        return todos.stream()
                .map(todoMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponseDto<TodoDto> searchTodos(UUID userId, String searchTerm, Integer page, Integer size) {
        log.info("Searching todos for user: {} with term: {}", userId, searchTerm);
        Pageable pageable = PageRequest.of(page, size);
        Page<Todo> todoPage = todoRepository.searchTodos(userId, searchTerm, pageable);
        
        return createPagedResponse(todoPage);
    }

    @Override
    @CacheEvict(value = "todos", key = "#id.toString().concat('-').concat(#userId)")
    public TodoDto updateTodoStatus(UUID id, UUID userId, Todo.TodoStatus status) {
        log.info("Updating todo status to {} for todo id: {}", status, id);
        Todo todo = todoRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Todo", "id", id));
        
        todo.setStatus(status);
        if (status == Todo.TodoStatus.COMPLETED) {
            todo.setCompletedAt(LocalDateTime.now());
        } else {
            todo.setCompletedAt(null);
        }
        
        Todo updatedTodo = todoRepository.save(todo);
        return todoMapper.toDto(updatedTodo);
    }

    private PagedResponseDto<TodoDto> createPagedResponse(Page<Todo> page) {
        List<TodoDto> content = page.getContent().stream()
                .map(todoMapper::toDto)
                .collect(Collectors.toList());
                
        return PagedResponseDto.<TodoDto>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}