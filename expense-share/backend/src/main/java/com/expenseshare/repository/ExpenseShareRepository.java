package com.expenseshare.repository;

import com.expenseshare.entity.ExpenseShare;
import com.expenseshare.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for ExpenseShare entity.
 * Provides database operations for expense share management.
 */
@Repository
public interface ExpenseShareRepository extends JpaRepository<ExpenseShare, Long> {

    /**
     * Find all shares for a specific user.
     */
    List<ExpenseShare> findByUser(User user);

    /**
     * Find all unsettled shares for a user.
     */
    List<ExpenseShare> findByUserAndSettledFalse(User user);

    /**
     * Find all shares for a specific expense.
     */
    @Query("SELECT s FROM ExpenseShare s WHERE s.expense.id = :expenseId")
    List<ExpenseShare> findByExpenseId(@Param("expenseId") Long expenseId);
}
