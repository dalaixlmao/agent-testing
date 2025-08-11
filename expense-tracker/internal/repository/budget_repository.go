package repository

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/expense-tracker/internal/model"
)

// BudgetRepository handles budget database operations
type BudgetRepository struct {
	db *Database
}

// NewBudgetRepository creates a new budget repository
func NewBudgetRepository(db *Database) *BudgetRepository {
	return &BudgetRepository{db: db}
}

// GetByID fetches a budget by ID and user ID
func (r *BudgetRepository) GetByID(ctx context.Context, id string, userID string) (*model.Budget, error) {
	budget := model.Budget{}
	err := r.db.GetDB().GetContext(ctx, &budget, 
		"SELECT * FROM budgets WHERE id = ? AND user_id = ?", id, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // No budget found, not an error
		}
		return nil, err
	}
	return &budget, nil
}

// GetAllByUserID fetches all budgets for a user
func (r *BudgetRepository) GetAllByUserID(ctx context.Context, userID string, active bool) ([]*model.Budget, error) {
	budgets := []*model.Budget{}
	
	query := "SELECT * FROM budgets WHERE user_id = ?"
	args := []interface{}{userID}
	
	// If active is true, only return budgets that are currently active
	if active {
		now := time.Now()
		query += " AND start_date <= ? AND end_date >= ?"
		args = append(args, now, now)
	}
	
	query += " ORDER BY start_date DESC"
	
	err := r.db.GetDB().SelectContext(ctx, &budgets, query, args...)
	if err != nil {
		return nil, err
	}
	return budgets, nil
}

// GetActiveBudgetForCategory fetches the active budget for a specific category
func (r *BudgetRepository) GetActiveBudgetForCategory(ctx context.Context, categoryID, userID string) (*model.Budget, error) {
	now := time.Now()
	budget := model.Budget{}
	
	err := r.db.GetDB().GetContext(ctx, &budget, `
		SELECT * FROM budgets 
		WHERE user_id = ? AND category_id = ? AND start_date <= ? AND end_date >= ? 
		ORDER BY created_at DESC LIMIT 1
	`, userID, categoryID, now, now)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // No budget found, not an error
		}
		return nil, err
	}
	return &budget, nil
}

// Create creates a new budget
func (r *BudgetRepository) Create(ctx context.Context, budget *model.Budget) error {
	// Check if a budget for this category and with overlapping dates already exists
	var count int
	err := r.db.GetDB().GetContext(ctx, &count, `
		SELECT COUNT(*) FROM budgets
		WHERE user_id = ? AND category_id = ? 
		AND ((start_date <= ? AND end_date >= ?) OR (start_date <= ? AND end_date >= ?))
	`, budget.UserID, budget.CategoryID, 
	   budget.EndDate, budget.StartDate, // first condition: new budget ends during existing budget
	   budget.StartDate, budget.EndDate) // second condition: new budget starts during existing budget
	
	if err != nil {
		return err
	}
	
	if count > 0 {
		return errors.New("a budget for this category with overlapping dates already exists")
	}
	
	// Create the budget
	_, err = r.db.GetDB().NamedExecContext(ctx, `
		INSERT INTO budgets (id, user_id, category_id, amount, period, start_date, end_date, created_at, updated_at) 
		VALUES (:id, :user_id, :category_id, :amount, :period, :start_date, :end_date, :created_at, :updated_at)
	`, budget)
	return err
}

// Update updates an existing budget
func (r *BudgetRepository) Update(ctx context.Context, budget *model.Budget) error {
	budget.UpdatedAt = time.Now()
	
	// Check if another budget for this category and with overlapping dates exists (excluding this one)
	var count int
	err := r.db.GetDB().GetContext(ctx, &count, `
		SELECT COUNT(*) FROM budgets
		WHERE user_id = ? AND category_id = ? AND id != ?
		AND ((start_date <= ? AND end_date >= ?) OR (start_date <= ? AND end_date >= ?))
	`, budget.UserID, budget.CategoryID, budget.ID,
	   budget.EndDate, budget.StartDate, // first condition: new budget ends during existing budget
	   budget.StartDate, budget.EndDate) // second condition: new budget starts during existing budget
	
	if err != nil {
		return err
	}
	
	if count > 0 {
		return errors.New("another budget for this category with overlapping dates already exists")
	}
	
	// Update the budget
	_, err = r.db.GetDB().NamedExecContext(ctx, `
		UPDATE budgets 
		SET category_id = :category_id, 
			amount = :amount, 
			period = :period,
			start_date = :start_date,
			end_date = :end_date,
			updated_at = :updated_at 
		WHERE id = :id AND user_id = :user_id
	`, budget)
	return err
}

// Delete deletes a budget by ID and user ID
func (r *BudgetRepository) Delete(ctx context.Context, id string, userID string) error {
	result, err := r.db.GetDB().ExecContext(ctx, 
		"DELETE FROM budgets WHERE id = ? AND user_id = ?", id, userID)
	if err != nil {
		return err
	}
	
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return errors.New("budget not found")
	}
	
	return nil
}