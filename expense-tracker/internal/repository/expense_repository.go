package repository

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/expense-tracker/internal/model"
)

// ExpenseRepository handles expense database operations
type ExpenseRepository struct {
	db *Database
}

// NewExpenseRepository creates a new expense repository
func NewExpenseRepository(db *Database) *ExpenseRepository {
	return &ExpenseRepository{db: db}
}

// GetByID fetches an expense by ID and user ID
func (r *ExpenseRepository) GetByID(ctx context.Context, id string, userID string) (*model.Expense, error) {
	expense := model.Expense{}
	err := r.db.GetDB().GetContext(ctx, &expense, 
		"SELECT * FROM expenses WHERE id = ? AND user_id = ?", id, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // No expense found, not an error
		}
		return nil, err
	}
	return &expense, nil
}

// GetAllByUserID fetches all expenses for a user with optional filters
func (r *ExpenseRepository) GetAllByUserID(ctx context.Context, userID string, 
	startDate, endDate *time.Time, categoryID string, limit, offset int) ([]*model.Expense, error) {
	
	query := "SELECT * FROM expenses WHERE user_id = ?"
	args := []interface{}{userID}
	
	if startDate != nil {
		query += " AND date >= ?"
		args = append(args, startDate)
	}
	
	if endDate != nil {
		query += " AND date <= ?"
		args = append(args, endDate)
	}
	
	if categoryID != "" {
		query += " AND category_id = ?"
		args = append(args, categoryID)
	}
	
	query += " ORDER BY date DESC"
	
	if limit > 0 {
		query += " LIMIT ?"
		args = append(args, limit)
		
		if offset > 0 {
			query += " OFFSET ?"
			args = append(args, offset)
		}
	}
	
	expenses := []*model.Expense{}
	err := r.db.GetDB().SelectContext(ctx, &expenses, query, args...)
	if err != nil {
		return nil, err
	}
	return expenses, nil
}

// Create creates a new expense
func (r *ExpenseRepository) Create(ctx context.Context, expense *model.Expense) error {
	_, err := r.db.GetDB().NamedExecContext(ctx, `
		INSERT INTO expenses (id, user_id, category_id, amount, description, date, created_at, updated_at) 
		VALUES (:id, :user_id, :category_id, :amount, :description, :date, :created_at, :updated_at)
	`, expense)
	return err
}

// Update updates an existing expense
func (r *ExpenseRepository) Update(ctx context.Context, expense *model.Expense) error {
	expense.UpdatedAt = time.Now()
	_, err := r.db.GetDB().NamedExecContext(ctx, `
		UPDATE expenses 
		SET category_id = :category_id, 
			amount = :amount, 
			description = :description, 
			date = :date, 
			updated_at = :updated_at 
		WHERE id = :id AND user_id = :user_id
	`, expense)
	return err
}

// Delete deletes an expense by ID and user ID
func (r *ExpenseRepository) Delete(ctx context.Context, id string, userID string) error {
	result, err := r.db.GetDB().ExecContext(ctx, 
		"DELETE FROM expenses WHERE id = ? AND user_id = ?", id, userID)
	if err != nil {
		return err
	}
	
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return errors.New("expense not found")
	}
	
	return nil
}

// GetSummaryByCategory gets expense summaries grouped by category
func (r *ExpenseRepository) GetSummaryByCategory(ctx context.Context, userID string, 
	startDate, endDate *time.Time) ([]*model.ExpenseSummary, error) {
	
	query := `
		SELECT e.category_id, c.name as category_name, SUM(e.amount) as total_amount, COUNT(*) as count
		FROM expenses e
		JOIN categories c ON e.category_id = c.id
		WHERE e.user_id = ?
	`
	args := []interface{}{userID}
	
	if startDate != nil {
		query += " AND e.date >= ?"
		args = append(args, startDate)
	}
	
	if endDate != nil {
		query += " AND e.date <= ?"
		args = append(args, endDate)
	}
	
	query += " GROUP BY e.category_id, c.name ORDER BY total_amount DESC"
	
	summaries := []*model.ExpenseSummary{}
	err := r.db.GetDB().SelectContext(ctx, &summaries, query, args...)
	if err != nil {
		return nil, err
	}
	return summaries, nil
}

// GetTotalAmount gets the total expense amount for a user with optional filters
func (r *ExpenseRepository) GetTotalAmount(ctx context.Context, userID string, 
	startDate, endDate *time.Time, categoryID string) (float64, error) {
	
	query := "SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE user_id = ?"
	args := []interface{}{userID}
	
	if startDate != nil {
		query += " AND date >= ?"
		args = append(args, startDate)
	}
	
	if endDate != nil {
		query += " AND date <= ?"
		args = append(args, endDate)
	}
	
	if categoryID != "" {
		query += " AND category_id = ?"
		args = append(args, categoryID)
	}
	
	var total float64
	err := r.db.GetDB().GetContext(ctx, &total, query, args...)
	if err != nil {
		return 0, err
	}
	return total, nil
}