package com.scalable.todo.controller;

import com.scalable.todo.dto.PagedResponseDto;
import com.scalable.todo.dto.TodoDto;
import com.scalable.todo.entity.Todo;
import com.scalable.todo.service.TodoService;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import io.github.resilience4j.retry.annotation.Retry;
import io.micrometer.core.annotation.Timed;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/todos")
@RequiredArgsConstructor
@Slf4j
public class TodoController {

    private final TodoService todoService;
    
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Timed(value = "todos.create", description = "Time taken to create a new todo")
    public ResponseEntity<TodoDto> createTodo(@Valid @RequestBody TodoDto todoDto) {
        log.info("REST request to create a new todo");
        return ResponseEntity.status(HttpStatus.CREATED).body(todoService.createTodo(todoDto));
    }
    
    @PutMapping("/{id}")
    @Timed(value = "todos.update", description = "Time taken to update a todo")
    public ResponseEntity<TodoDto> updateTodo(
            @PathVariable UUID id, 
            @Valid @RequestBody TodoDto todoDto) {
        log.info("REST request to update todo with id: {}", id);
        return ResponseEntity.ok(todoService.updateTodo(id, todoDto));
    }
    
    @GetMapping("/{id}")
    @Timed(value = "todos.get", description = "Time taken to get a todo by ID")
    @CircuitBreaker(name = "todoService", fallbackMethod = "getTodoFallback")
    @RateLimiter(name = "todoService")
    @Retry(name = "todoService")
    public ResponseEntity<TodoDto> getTodo(
            @PathVariable UUID id,
            @RequestHeader("X-User-ID") UUID userId) {
        log.info("REST request to get todo with id: {}", id);
        return ResponseEntity.ok(todoService.getTodoById(id, userId));
    }
    
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Timed(value = "todos.delete", description = "Time taken to delete a todo")
    public ResponseEntity<Void> deleteTodo(
            @PathVariable UUID id,
            @RequestHeader("X-User-ID") UUID userId) {
        log.info("REST request to delete todo with id: {}", id);
        todoService.deleteTodo(id, userId);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/user")
    @Timed(value = "todos.list", description = "Time taken to list todos")
    @CircuitBreaker(name = "todoService", fallbackMethod = "getUserTodosFallback")
    public ResponseEntity<PagedResponseDto<TodoDto>> getUserTodos(
            @RequestHeader("X-User-ID") UUID userId,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(defaultValue = "dueDate") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        log.info("REST request to get all todos for user: {}", userId);
        return ResponseEntity.ok(todoService.getUserTodos(userId, page, size, sortBy, sortDir));
    }
    
    @GetMapping("/user/status/{status}")
    @Timed(value = "todos.list.by.status", description = "Time taken to list todos by status")
    public ResponseEntity<PagedResponseDto<TodoDto>> getUserTodosByStatus(
            @RequestHeader("X-User-ID") UUID userId,
            @PathVariable Todo.TodoStatus status,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(defaultValue = "dueDate") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        log.info("REST request to get todos with status: {} for user: {}", status, userId);
        return ResponseEntity.ok(todoService.getUserTodosByStatus(userId, status, page, size, sortBy, sortDir));
    }
    
    @GetMapping("/user/category/{categoryId}")
    @Timed(value = "todos.list.by.category", description = "Time taken to list todos by category")
    public ResponseEntity<PagedResponseDto<TodoDto>> getUserTodosByCategory(
            @RequestHeader("X-User-ID") UUID userId,
            @PathVariable UUID categoryId,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(defaultValue = "dueDate") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        log.info("REST request to get todos with category: {} for user: {}", categoryId, userId);
        return ResponseEntity.ok(todoService.getUserTodosByCategory(userId, categoryId, page, size, sortBy, sortDir));
    }
    
    @GetMapping("/user/overdue")
    @Timed(value = "todos.list.overdue", description = "Time taken to list overdue todos")
    public ResponseEntity<List<TodoDto>> getOverdueTodos(@RequestHeader("X-User-ID") UUID userId) {
        log.info("REST request to get overdue todos for user: {}", userId);
        return ResponseEntity.ok(todoService.getOverdueTodos(userId));
    }
    
    @GetMapping("/user/due-range")
    @Timed(value = "todos.list.due.range", description = "Time taken to list todos in date range")
    public ResponseEntity<List<TodoDto>> getTodosDueInDateRange(
            @RequestHeader("X-User-ID") UUID userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        log.info("REST request to get todos due between {} and {} for user: {}", start, end, userId);
        return ResponseEntity.ok(todoService.getTodosDueInDateRange(userId, start, end));
    }
    
    @GetMapping("/user/search")
    @Timed(value = "todos.search", description = "Time taken to search todos")
    public ResponseEntity<PagedResponseDto<TodoDto>> searchTodos(
            @RequestHeader("X-User-ID") UUID userId,
            @RequestParam String searchTerm,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        log.info("REST request to search todos with term: {} for user: {}", searchTerm, userId);
        return ResponseEntity.ok(todoService.searchTodos(userId, searchTerm, page, size));
    }
    
    @PatchMapping("/{id}/status")
    @Timed(value = "todos.update.status", description = "Time taken to update todo status")
    public ResponseEntity<TodoDto> updateTodoStatus(
            @PathVariable UUID id,
            @RequestHeader("X-User-ID") UUID userId,
            @RequestParam Todo.TodoStatus status) {
        log.info("REST request to update status to {} for todo with id: {}", status, id);
        return ResponseEntity.ok(todoService.updateTodoStatus(id, userId, status));
    }
    
    // Fallback methods for circuit breaker
    public ResponseEntity<TodoDto> getTodoFallback(UUID id, UUID userId, Exception ex) {
        log.error("Fallback: Unable to get todo with id: {}", id, ex);
        TodoDto fallbackTodo = new TodoDto();
        fallbackTodo.setTitle("Temporary fallback todo");
        fallbackTodo.setDescription("Service is currently unavailable. Please try again later.");
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(fallbackTodo);
    }
    
    public ResponseEntity<PagedResponseDto<TodoDto>> getUserTodosFallback(UUID userId, Integer page, Integer size, 
                                                      String sortBy, String sortDir, Exception ex) {
        log.error("Fallback: Unable to get todos for user: {}", userId, ex);
        PagedResponseDto<TodoDto> emptyResponse = new PagedResponseDto<>();
        emptyResponse.setContent(List.of());
        emptyResponse.setPageNumber(page);
        emptyResponse.setPageSize(size);
        emptyResponse.setTotalElements(0);
        emptyResponse.setTotalPages(0);
        emptyResponse.setLast(true);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(emptyResponse);
    }
}