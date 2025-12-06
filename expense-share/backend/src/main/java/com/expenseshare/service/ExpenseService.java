package com.expenseshare.service;

import com.expenseshare.dto.ExpenseRequest;
import com.expenseshare.dto.ExpenseResponse;
import com.expenseshare.entity.Expense;
import com.expenseshare.entity.ExpenseShare;
import com.expenseshare.entity.User;
import com.expenseshare.exception.BadRequestException;
import com.expenseshare.exception.ResourceNotFoundException;
import com.expenseshare.repository.ExpenseRepository;
import com.expenseshare.repository.ExpenseShareRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for expense operations.
 */
@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private ExpenseShareRepository expenseShareRepository;

    @Autowired
    private UserService userService;

    /**
     * Create a new expense.
     */
    @Transactional
    public ExpenseResponse createExpense(ExpenseRequest request) {
        User currentUser = userService.getCurrentUser();

        validateExpenseRequest(request);

        Expense expense = Expense.builder()
                .description(request.getDescription())
                .amount(request.getAmount())
                .paidBy(currentUser)
                .expenseDate(request.getExpenseDate())
                .category(request.getCategory())
                .notes(request.getNotes())
                .build();

        Expense savedExpense = expenseRepository.save(expense);

        for (ExpenseRequest.ShareDetail shareDetail : request.getShares()) {
            User shareUser = userService.getUserById(shareDetail.getUserId());
            ExpenseShare share = ExpenseShare.builder()
                    .expense(savedExpense)
                    .user(shareUser)
                    .shareAmount(shareDetail.getShareAmount())
                    .settled(false)
                    .build();
            savedExpense.addShare(share);
        }

        savedExpense = expenseRepository.save(savedExpense);
        return mapToExpenseResponse(savedExpense);
    }

    /**
     * Get all expenses for current user.
     */
    @Transactional(readOnly = true)
    public List<ExpenseResponse> getAllExpensesForCurrentUser() {
        User currentUser = userService.getCurrentUser();
        List<Expense> expenses = expenseRepository.findAllExpensesInvolving(currentUser);
        return expenses.stream()
                .map(this::mapToExpenseResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get expense by ID.
     */
    @Transactional(readOnly = true)
    public ExpenseResponse getExpenseById(Long expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", expenseId));
        return mapToExpenseResponse(expense);
    }

    /**
     * Update an expense.
     */
    @Transactional
    public ExpenseResponse updateExpense(Long expenseId, ExpenseRequest request) {
        User currentUser = userService.getCurrentUser();
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", expenseId));

        if (!expense.getPaidBy().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only update expenses you created");
        }

        validateExpenseRequest(request);

        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());
        expense.setExpenseDate(request.getExpenseDate());
        expense.setCategory(request.getCategory());
        expense.setNotes(request.getNotes());

        expense.getShares().clear();

        for (ExpenseRequest.ShareDetail shareDetail : request.getShares()) {
            User shareUser = userService.getUserById(shareDetail.getUserId());
            ExpenseShare share = ExpenseShare.builder()
                    .expense(expense)
                    .user(shareUser)
                    .shareAmount(shareDetail.getShareAmount())
                    .settled(false)
                    .build();
            expense.addShare(share);
        }

        Expense updatedExpense = expenseRepository.save(expense);
        return mapToExpenseResponse(updatedExpense);
    }

    /**
     * Delete an expense.
     */
    @Transactional
    public void deleteExpense(Long expenseId) {
        User currentUser = userService.getCurrentUser();
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", expenseId));

        if (!expense.getPaidBy().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only delete expenses you created");
        }

        expenseRepository.delete(expense);
    }

    /**
     * Validate expense request.
     */
    private void validateExpenseRequest(ExpenseRequest request) {
        BigDecimal totalShares = request.getShares().stream()
                .map(ExpenseRequest.ShareDetail::getShareAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalShares.compareTo(request.getAmount()) != 0) {
            throw new BadRequestException(
                    String.format("Total shares (%s) must equal expense amount (%s)",
                            totalShares, request.getAmount()));
        }
    }

    /**
     * Map Expense entity to ExpenseResponse DTO.
     */
    private ExpenseResponse mapToExpenseResponse(Expense expense) {
        List<ExpenseResponse.ShareResponse> shares = expense.getShares().stream()
                .map(share -> ExpenseResponse.ShareResponse.builder()
                        .id(share.getId())
                        .user(userService.mapToUserResponse(share.getUser()))
                        .shareAmount(share.getShareAmount())
                        .settled(share.getSettled())
                        .build())
                .collect(Collectors.toList());

        return ExpenseResponse.builder()
                .id(expense.getId())
                .description(expense.getDescription())
                .amount(expense.getAmount())
                .paidBy(userService.mapToUserResponse(expense.getPaidBy()))
                .shares(shares)
                .expenseDate(expense.getExpenseDate())
                .category(expense.getCategory())
                .notes(expense.getNotes())
                .createdAt(expense.getCreatedAt())
                .updatedAt(expense.getUpdatedAt())
                .build();
    }
}
