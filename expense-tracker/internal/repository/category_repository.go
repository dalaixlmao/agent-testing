package repository

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/expense-tracker/internal/model"
)

// CategoryRepository handles category database operations
type CategoryRepository struct {
	db *Database
}

// NewCategoryRepository creates a new category repository
func NewCategoryRepository(db *Database) *CategoryRepository {
	return &CategoryRepository{db: db}
}

// GetByID fetches a category by ID and user ID
func (r *CategoryRepository) GetByID(ctx context.Context, id string, userID string) (*model.Category, error) {
	category := model.Category{}
	err := r.db.GetDB().GetContext(ctx, &category, 
		"SELECT * FROM categories WHERE id = ? AND user_id = ?", id, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // No category found, not an error
		}
		return nil, err
	}
	return &category, nil
}

// GetAllByUserID fetches all categories for a user
func (r *CategoryRepository) GetAllByUserID(ctx context.Context, userID string) ([]*model.Category, error) {
	categories := []*model.Category{}
	err := r.db.GetDB().SelectContext(ctx, &categories, 
		"SELECT * FROM categories WHERE user_id = ? ORDER BY name", userID)
	if err != nil {
		return nil, err
	}
	return categories, nil
}

// Create creates a new category
func (r *CategoryRepository) Create(ctx context.Context, category *model.Category) error {
	_, err := r.db.GetDB().NamedExecContext(ctx, `
		INSERT INTO categories (id, user_id, name, description, created_at, updated_at) 
		VALUES (:id, :user_id, :name, :description, :created_at, :updated_at)
	`, category)
	return err
}

// Update updates an existing category
func (r *CategoryRepository) Update(ctx context.Context, category *model.Category) error {
	category.UpdatedAt = time.Now()
	_, err := r.db.GetDB().NamedExecContext(ctx, `
		UPDATE categories 
		SET name = :name, 
			description = :description, 
			updated_at = :updated_at 
		WHERE id = :id AND user_id = :user_id
	`, category)
	return err
}

// Delete deletes a category by ID and user ID
func (r *CategoryRepository) Delete(ctx context.Context, id string, userID string) error {
	// Check if the category has associated expenses
	var count int
	err := r.db.GetDB().GetContext(ctx, &count, 
		"SELECT COUNT(*) FROM expenses WHERE category_id = ? AND user_id = ?", id, userID)
	if err != nil {
		return err
	}
	
	if count > 0 {
		return errors.New("cannot delete category with associated expenses")
	}
	
	// Delete related budgets first
	_, err = r.db.GetDB().ExecContext(ctx, 
		"DELETE FROM budgets WHERE category_id = ? AND user_id = ?", id, userID)
	if err != nil {
		return err
	}
	
	// Then delete the category
	result, err := r.db.GetDB().ExecContext(ctx, 
		"DELETE FROM categories WHERE id = ? AND user_id = ?", id, userID)
	if err != nil {
		return err
	}
	
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return errors.New("category not found")
	}
	
	return nil
}