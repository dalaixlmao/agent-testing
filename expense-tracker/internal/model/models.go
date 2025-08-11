package model

import (
	"time"

	"github.com/google/uuid"
)

// User represents an application user
type User struct {
	ID        string    `json:"id" db:"id"`
	Email     string    `json:"email" db:"email"`
	Password  string    `json:"-" db:"password_hash"`
	FirstName string    `json:"firstName" db:"first_name"`
	LastName  string    `json:"lastName" db:"last_name"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt time.Time `json:"updatedAt" db:"updated_at"`
}

// NewUser creates a new user with generated UUID and timestamps
func NewUser(email, passwordHash, firstName, lastName string) *User {
	now := time.Now()
	return &User{
		ID:        uuid.New().String(),
		Email:     email,
		Password:  passwordHash,
		FirstName: firstName,
		LastName:  lastName,
		CreatedAt: now,
		UpdatedAt: now,
	}
}

// Category represents an expense category
type Category struct {
	ID          string    `json:"id" db:"id"`
	UserID      string    `json:"userId" db:"user_id"`
	Name        string    `json:"name" db:"name"`
	Description string    `json:"description" db:"description"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt   time.Time `json:"updatedAt" db:"updated_at"`
}

// NewCategory creates a new category with generated UUID and timestamps
func NewCategory(userID, name, description string) *Category {
	now := time.Now()
	return &Category{
		ID:          uuid.New().String(),
		UserID:      userID,
		Name:        name,
		Description: description,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
}

// Expense represents a user expense
type Expense struct {
	ID          string    `json:"id" db:"id"`
	UserID      string    `json:"userId" db:"user_id"`
	CategoryID  string    `json:"categoryId" db:"category_id"`
	Amount      float64   `json:"amount" db:"amount"`
	Description string    `json:"description" db:"description"`
	Date        time.Time `json:"date" db:"date"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt   time.Time `json:"updatedAt" db:"updated_at"`
}

// NewExpense creates a new expense with generated UUID and timestamps
func NewExpense(userID, categoryID string, amount float64, description string, date time.Time) *Expense {
	now := time.Now()
	return &Expense{
		ID:          uuid.New().String(),
		UserID:      userID,
		CategoryID:  categoryID,
		Amount:      amount,
		Description: description,
		Date:        date,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
}

// Budget represents a user's budget for a specific category
type Budget struct {
	ID         string    `json:"id" db:"id"`
	UserID     string    `json:"userId" db:"user_id"`
	CategoryID string    `json:"categoryId" db:"category_id"`
	Amount     float64   `json:"amount" db:"amount"`
	Period     string    `json:"period" db:"period"` // monthly, yearly, etc.
	StartDate  time.Time `json:"startDate" db:"start_date"`
	EndDate    time.Time `json:"endDate" db:"end_date"`
	CreatedAt  time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt  time.Time `json:"updatedAt" db:"updated_at"`
}

// NewBudget creates a new budget with generated UUID and timestamps
func NewBudget(userID, categoryID string, amount float64, period string, startDate, endDate time.Time) *Budget {
	now := time.Now()
	return &Budget{
		ID:         uuid.New().String(),
		UserID:     userID,
		CategoryID: categoryID,
		Amount:     amount,
		Period:     period,
		StartDate:  startDate,
		EndDate:    endDate,
		CreatedAt:  now,
		UpdatedAt:  now,
	}
}

// Report represents a summary of expenses
type ExpenseSummary struct {
	CategoryID   string  `json:"categoryId" db:"category_id"`
	CategoryName string  `json:"categoryName" db:"category_name"`
	TotalAmount  float64 `json:"totalAmount" db:"total_amount"`
	Count        int     `json:"count" db:"count"`
}

// AuthRequest represents a login/register request
type AuthRequest struct {
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required,min=6"`
	FirstName string `json:"firstName,omitempty"`
	LastName  string `json:"lastName,omitempty"`
}

// LoginResponse represents a successful login response
type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

// ExpenseRequest represents an expense creation/update request
type ExpenseRequest struct {
	CategoryID  string    `json:"categoryId" binding:"required"`
	Amount      float64   `json:"amount" binding:"required,gt=0"`
	Description string    `json:"description" binding:"required"`
	Date        time.Time `json:"date" binding:"required"`
}

// CategoryRequest represents a category creation/update request
type CategoryRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
}

// BudgetRequest represents a budget creation/update request
type BudgetRequest struct {
	CategoryID string    `json:"categoryId" binding:"required"`
	Amount     float64   `json:"amount" binding:"required,gt=0"`
	Period     string    `json:"period" binding:"required,oneof=daily weekly monthly yearly"`
	StartDate  time.Time `json:"startDate" binding:"required"`
	EndDate    time.Time `json:"endDate" binding:"required"`
}