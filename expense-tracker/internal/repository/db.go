package repository

import (
	"context"
	"time"

	"github.com/expense-tracker/internal/config"
	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3"
)

// Database represents a database connection
type Database struct {
	db *sqlx.DB
}

// NewDatabase creates a new database connection
func NewDatabase(cfg *config.Config) (*Database, error) {
	db, err := sqlx.Connect(cfg.Database.Driver, cfg.Database.ConnectionString)
	if err != nil {
		return nil, err
	}

	db.SetMaxOpenConns(cfg.Database.MaxOpenConns)
	db.SetMaxIdleConns(cfg.Database.MaxIdleConns)
	db.SetConnMaxLifetime(time.Duration(cfg.Database.ConnMaxLifetime) * time.Second)

	return &Database{db: db}, nil
}

// Close closes the database connection
func (d *Database) Close() error {
	return d.db.Close()
}

// InitSchema initializes the database schema
func (d *Database) InitSchema() error {
	schema := `
	CREATE TABLE IF NOT EXISTS users (
		id TEXT PRIMARY KEY,
		email TEXT UNIQUE NOT NULL,
		password_hash TEXT NOT NULL,
		first_name TEXT NOT NULL,
		last_name TEXT NOT NULL,
		created_at DATETIME NOT NULL,
		updated_at DATETIME NOT NULL
	);

	CREATE TABLE IF NOT EXISTS categories (
		id TEXT PRIMARY KEY,
		user_id TEXT NOT NULL,
		name TEXT NOT NULL,
		description TEXT,
		created_at DATETIME NOT NULL,
		updated_at DATETIME NOT NULL,
		FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
	);

	CREATE TABLE IF NOT EXISTS expenses (
		id TEXT PRIMARY KEY,
		user_id TEXT NOT NULL,
		category_id TEXT NOT NULL,
		amount REAL NOT NULL,
		description TEXT NOT NULL,
		date DATETIME NOT NULL,
		created_at DATETIME NOT NULL,
		updated_at DATETIME NOT NULL,
		FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
		FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
	);

	CREATE TABLE IF NOT EXISTS budgets (
		id TEXT PRIMARY KEY,
		user_id TEXT NOT NULL,
		category_id TEXT NOT NULL,
		amount REAL NOT NULL,
		period TEXT NOT NULL,
		start_date DATETIME NOT NULL,
		end_date DATETIME NOT NULL,
		created_at DATETIME NOT NULL,
		updated_at DATETIME NOT NULL,
		FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
		FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
	);

	CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses (user_id);
	CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses (category_id);
	CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses (date);
	CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories (user_id);
	CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets (user_id);
	CREATE INDEX IF NOT EXISTS idx_budgets_category_id ON budgets (category_id);
	`

	_, err := d.db.Exec(schema)
	return err
}

// GetDB returns the underlying sqlx.DB instance
func (d *Database) GetDB() *sqlx.DB {
	return d.db
}

// WithTransaction executes the given function within a transaction
func (d *Database) WithTransaction(ctx context.Context, fn func(*sqlx.Tx) error) error {
	tx, err := d.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}

	defer func() {
		// If the function panics, rollback the transaction
		if p := recover(); p != nil {
			_ = tx.Rollback()
			panic(p) // re-throw the panic
		}
	}()

	// Execute the function
	err = fn(tx)
	if err != nil {
		// Rollback the transaction if the function returns an error
		_ = tx.Rollback()
		return err
	}

	// Commit the transaction
	return tx.Commit()
}