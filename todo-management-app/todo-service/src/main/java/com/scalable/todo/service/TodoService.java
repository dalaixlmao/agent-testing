package com.scalable.todo.service;

import com.scalable.todo.dto.PagedResponseDto;
import com.scalable.todo.dto.TodoDto;
import com.scalable.todo.entity.Todo;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface TodoService {
    
    TodoDto createTodo(TodoDto todoDto);
    
    TodoDto updateTodo(UUID id, TodoDto todoDto);
    
    TodoDto getTodoById(UUID id, UUID userId);
    
    void deleteTodo(UUID id, UUID userId);
    
    PagedResponseDto<TodoDto> getUserTodos(UUID userId, Integer page, Integer size, String sortBy, String sortDir);
    
    PagedResponseDto<TodoDto> getUserTodosByStatus(UUID userId, Todo.TodoStatus status, Integer page, Integer size, String sortBy, String sortDir);
    
    PagedResponseDto<TodoDto> getUserTodosByCategory(UUID userId, UUID categoryId, Integer page, Integer size, String sortBy, String sortDir);
    
    List<TodoDto> getOverdueTodos(UUID userId);
    
    List<TodoDto> getTodosDueInDateRange(UUID userId, LocalDateTime start, LocalDateTime end);
    
    PagedResponseDto<TodoDto> searchTodos(UUID userId, String searchTerm, Integer page, Integer size);
    
    TodoDto updateTodoStatus(UUID id, UUID userId, Todo.TodoStatus status);
}