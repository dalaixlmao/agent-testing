package model

import (
	"testing"
	"time"
)

func TestNewUser(t *testing.T) {
	email := "test@example.com"
	password := "hashedpassword"
	firstName := "Test"
	lastName := "User"

	user := NewUser(email, password, firstName, lastName)

	if user.ID == "" {
		t.Error("Expected user ID to be generated")
	}
	if user.Email != email {
		t.Errorf("Expected email to be %s, got %s", email, user.Email)
	}
	if user.Password != password {
		t.Errorf("Expected password to be %s, got %s", password, user.Password)
	}
	if user.FirstName != firstName {
		t.Errorf("Expected firstName to be %s, got %s", firstName, user.FirstName)
	}
	if user.LastName != lastName {
		t.Errorf("Expected lastName to be %s, got %s", lastName, user.LastName)
	}
	if user.CreatedAt.IsZero() {
		t.Error("Expected CreatedAt to be set")
	}
	if user.UpdatedAt.IsZero() {
		t.Error("Expected UpdatedAt to be set")
	}
}

func TestNewCategory(t *testing.T) {
	userID := "user123"
	name := "Groceries"
	description := "Food expenses"

	category := NewCategory(userID, name, description)

	if category.ID == "" {
		t.Error("Expected category ID to be generated")
	}
	if category.UserID != userID {
		t.Errorf("Expected userID to be %s, got %s", userID, category.UserID)
	}
	if category.Name != name {
		t.Errorf("Expected name to be %s, got %s", name, category.Name)
	}
	if category.Description != description {
		t.Errorf("Expected description to be %s, got %s", description, category.Description)
	}
	if category.CreatedAt.IsZero() {
		t.Error("Expected CreatedAt to be set")
	}
	if category.UpdatedAt.IsZero() {
		t.Error("Expected UpdatedAt to be set")
	}
}

func TestNewExpense(t *testing.T) {
	userID := "user123"
	categoryID := "cat456"
	amount := 42.75
	description := "Weekly groceries"
	date := time.Now().Truncate(time.Second)

	expense := NewExpense(userID, categoryID, amount, description, date)

	if expense.ID == "" {
		t.Error("Expected expense ID to be generated")
	}
	if expense.UserID != userID {
		t.Errorf("Expected userID to be %s, got %s", userID, expense.UserID)
	}
	if expense.CategoryID != categoryID {
		t.Errorf("Expected categoryID to be %s, got %s", categoryID, expense.CategoryID)
	}
	if expense.Amount != amount {
		t.Errorf("Expected amount to be %.2f, got %.2f", amount, expense.Amount)
	}
	if expense.Description != description {
		t.Errorf("Expected description to be %s, got %s", description, expense.Description)
	}
	if !expense.Date.Equal(date) {
		t.Errorf("Expected date to be %v, got %v", date, expense.Date)
	}
	if expense.CreatedAt.IsZero() {
		t.Error("Expected CreatedAt to be set")
	}
	if expense.UpdatedAt.IsZero() {
		t.Error("Expected UpdatedAt to be set")
	}
}

func TestNewBudget(t *testing.T) {
	userID := "user123"
	categoryID := "cat456"
	amount := 500.00
	period := "monthly"
	startDate := time.Now().Truncate(time.Second)
	endDate := startDate.AddDate(0, 1, 0)

	budget := NewBudget(userID, categoryID, amount, period, startDate, endDate)

	if budget.ID == "" {
		t.Error("Expected budget ID to be generated")
	}
	if budget.UserID != userID {
		t.Errorf("Expected userID to be %s, got %s", userID, budget.UserID)
	}
	if budget.CategoryID != categoryID {
		t.Errorf("Expected categoryID to be %s, got %s", categoryID, budget.CategoryID)
	}
	if budget.Amount != amount {
		t.Errorf("Expected amount to be %.2f, got %.2f", amount, budget.Amount)
	}
	if budget.Period != period {
		t.Errorf("Expected period to be %s, got %s", period, budget.Period)
	}
	if !budget.StartDate.Equal(startDate) {
		t.Errorf("Expected startDate to be %v, got %v", startDate, budget.StartDate)
	}
	if !budget.EndDate.Equal(endDate) {
		t.Errorf("Expected endDate to be %v, got %v", endDate, budget.EndDate)
	}
	if budget.CreatedAt.IsZero() {
		t.Error("Expected CreatedAt to be set")
	}
	if budget.UpdatedAt.IsZero() {
		t.Error("Expected UpdatedAt to be set")
	}
}