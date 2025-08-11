package repository

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/expense-tracker/internal/model"
	"github.com/jmoiron/sqlx"
)

// UserRepository handles user database operations
type UserRepository struct {
	db *Database
}

// NewUserRepository creates a new user repository
func NewUserRepository(db *Database) *UserRepository {
	return &UserRepository{db: db}
}

// GetByID fetches a user by ID
func (r *UserRepository) GetByID(ctx context.Context, id string) (*model.User, error) {
	user := model.User{}
	err := r.db.GetDB().GetContext(ctx, &user, "SELECT * FROM users WHERE id = ?", id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // No user found, not an error
		}
		return nil, err
	}
	return &user, nil
}

// GetByEmail fetches a user by email
func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*model.User, error) {
	user := model.User{}
	err := r.db.GetDB().GetContext(ctx, &user, "SELECT * FROM users WHERE email = ?", email)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // No user found, not an error
		}
		return nil, err
	}
	return &user, nil
}

// Create creates a new user
func (r *UserRepository) Create(ctx context.Context, user *model.User) error {
	_, err := r.db.GetDB().NamedExecContext(ctx, `
		INSERT INTO users (id, email, password_hash, first_name, last_name, created_at, updated_at) 
		VALUES (:id, :email, :password_hash, :first_name, :last_name, :created_at, :updated_at)
	`, user)
	return err
}

// Update updates an existing user
func (r *UserRepository) Update(ctx context.Context, user *model.User) error {
	user.UpdatedAt = time.Now()
	_, err := r.db.GetDB().NamedExecContext(ctx, `
		UPDATE users 
		SET email = :email, 
			password_hash = :password_hash, 
			first_name = :first_name, 
			last_name = :last_name, 
			updated_at = :updated_at 
		WHERE id = :id
	`, user)
	return err
}

// Delete deletes a user by ID
func (r *UserRepository) Delete(ctx context.Context, id string) error {
	// Start a transaction for cascading delete
	return r.db.WithTransaction(ctx, func(tx *sqlx.Tx) error {
		// Delete related records first
		_, err := tx.ExecContext(ctx, "DELETE FROM budgets WHERE user_id = ?", id)
		if err != nil {
			return err
		}
		
		_, err = tx.ExecContext(ctx, "DELETE FROM expenses WHERE user_id = ?", id)
		if err != nil {
			return err
		}
		
		_, err = tx.ExecContext(ctx, "DELETE FROM categories WHERE user_id = ?", id)
		if err != nil {
			return err
		}
		
		// Finally delete the user
		result, err := tx.ExecContext(ctx, "DELETE FROM users WHERE id = ?", id)
		if err != nil {
			return err
		}
		
		rows, err := result.RowsAffected()
		if err != nil {
			return err
		}
		if rows == 0 {
			return errors.New("user not found")
		}
		
		return nil
	})
}