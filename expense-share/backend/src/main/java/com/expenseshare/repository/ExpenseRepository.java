package com.expenseshare.repository;

import com.expenseshare.entity.Expense;
import com.expenseshare.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Expense entity.
 * Provides database operations for expense management.
 */
@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    /**
     * Find all expenses paid by a specific user.
     */
    List<Expense> findByPaidByOrderByExpenseDateDesc(User paidBy);

    /**
     * Find all expenses where a user is involved (either paid or shared).
     */
    @Query("SELECT DISTINCT e FROM Expense e " +
           "LEFT JOIN e.shares s " +
           "WHERE e.paidBy = :user OR s.user = :user " +
           "ORDER BY e.expenseDate DESC")
    List<Expense> findAllExpensesInvolving(@Param("user") User user);

    /**
     * Find all expenses between two users.
     */
    @Query("SELECT DISTINCT e FROM Expense e " +
           "LEFT JOIN e.shares s " +
           "WHERE (e.paidBy = :user1 AND s.user = :user2) " +
           "OR (e.paidBy = :user2 AND s.user = :user1) " +
           "ORDER BY e.expenseDate DESC")
    List<Expense> findExpensesBetweenUsers(@Param("user1") User user1, @Param("user2") User user2);
}
