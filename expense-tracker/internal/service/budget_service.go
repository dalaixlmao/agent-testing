package service

import (
	"context"
	"errors"
	"time"

	"github.com/expense-tracker/internal/model"
	"github.com/expense-tracker/internal/repository"
)

// BudgetService handles budget business logic
type BudgetService struct {
	budgetRepo   *repository.BudgetRepository
	categoryRepo *repository.CategoryRepository
	expenseRepo  *repository.ExpenseRepository
}

// NewBudgetService creates a new budget service
func NewBudgetService(
	budgetRepo *repository.BudgetRepository,
	categoryRepo *repository.CategoryRepository,
	expenseRepo *repository.ExpenseRepository,
) *BudgetService {
	return &BudgetService{
		budgetRepo:   budgetRepo,
		categoryRepo: categoryRepo,
		expenseRepo:  expenseRepo,
	}
}

// GetByID fetches a budget by ID
func (s *BudgetService) GetByID(ctx context.Context, id string, userID string) (*model.Budget, error) {
	budget, err := s.budgetRepo.GetByID(ctx, id, userID)
	if err != nil {
		return nil, err
	}
	
	if budget == nil {
		return nil, errors.New("budget not found")
	}
	
	return budget, nil
}

// GetAllByUserID fetches all budgets for a user
func (s *BudgetService) GetAllByUserID(ctx context.Context, userID string, active bool) ([]*model.Budget, error) {
	return s.budgetRepo.GetAllByUserID(ctx, userID, active)
}

// Create creates a new budget
func (s *BudgetService) Create(ctx context.Context, userID, categoryID string, 
	amount float64, period string, startDate, endDate time.Time) (*model.Budget, error) {
	
	// Validate category
	category, err := s.categoryRepo.GetByID(ctx, categoryID, userID)
	if err != nil {
		return nil, err
	}
	
	if category == nil {
		return nil, errors.New("category not found")
	}
	
	// Validate dates
	if startDate.After(endDate) {
		return nil, errors.New("start date must be before end date")
	}
	
	// Validate period
	if !isValidPeriod(period) {
		return nil, errors.New("invalid period, must be one of: daily, weekly, monthly, yearly")
	}
	
	// Create the budget
	budget := model.NewBudget(userID, categoryID, amount, period, startDate, endDate)
	err = s.budgetRepo.Create(ctx, budget)
	if err != nil {
		return nil, err
	}
	
	return budget, nil
}

// Update updates a budget
func (s *BudgetService) Update(ctx context.Context, id, userID, categoryID string, 
	amount float64, period string, startDate, endDate time.Time) (*model.Budget, error) {
	
	// Check if budget exists and belongs to the user
	budget, err := s.budgetRepo.GetByID(ctx, id, userID)
	if err != nil {
		return nil, err
	}
	
	if budget == nil {
		return nil, errors.New("budget not found")
	}
	
	// Validate category if changed
	if budget.CategoryID != categoryID {
		category, err := s.categoryRepo.GetByID(ctx, categoryID, userID)
		if err != nil {
			return nil, err
		}
		
		if category == nil {
			return nil, errors.New("category not found")
		}
	}
	
	// Validate dates
	if startDate.After(endDate) {
		return nil, errors.New("start date must be before end date")
	}
	
	// Validate period
	if !isValidPeriod(period) {
		return nil, errors.New("invalid period, must be one of: daily, weekly, monthly, yearly")
	}
	
	// Update the budget
	budget.CategoryID = categoryID
	budget.Amount = amount
	budget.Period = period
	budget.StartDate = startDate
	budget.EndDate = endDate
	
	err = s.budgetRepo.Update(ctx, budget)
	if err != nil {
		return nil, err
	}
	
	return budget, nil
}

// Delete deletes a budget
func (s *BudgetService) Delete(ctx context.Context, id, userID string) error {
	return s.budgetRepo.Delete(ctx, id, userID)
}

// GetBudgetStatus gets the current status of a budget
func (s *BudgetService) GetBudgetStatus(ctx context.Context, budgetID, userID string) (map[string]interface{}, error) {
	// Get the budget
	budget, err := s.budgetRepo.GetByID(ctx, budgetID, userID)
	if err != nil {
		return nil, err
	}
	
	if budget == nil {
		return nil, errors.New("budget not found")
	}
	
	// Get the category
	category, err := s.categoryRepo.GetByID(ctx, budget.CategoryID, userID)
	if err != nil || category == nil {
		return nil, errors.New("category not found")
	}
	
	// Get the total expenses for this budget's time period and category
	totalExpenses, err := s.expenseRepo.GetTotalAmount(
		ctx, userID, &budget.StartDate, &budget.EndDate, budget.CategoryID)
	if err != nil {
		return nil, err
	}
	
	// Calculate remaining amount and percentage
	remaining := budget.Amount - totalExpenses
	percentage := 0.0
	if budget.Amount > 0 {
		percentage = (totalExpenses / budget.Amount) * 100
	}
	
	// Calculate time progress
	now := time.Now()
	var timeProgress float64 = 0
	
	// If budget has started but not ended
	if now.After(budget.StartDate) && now.Before(budget.EndDate) {
		totalDuration := budget.EndDate.Sub(budget.StartDate)
		elapsedDuration := now.Sub(budget.StartDate)
		timeProgress = (float64(elapsedDuration) / float64(totalDuration)) * 100
	} else if now.After(budget.EndDate) {
		// Budget has ended
		timeProgress = 100
	}
	
	// Determine status
	var status string
	if now.Before(budget.StartDate) {
		status = "upcoming"
	} else if now.After(budget.EndDate) {
		status = "expired"
	} else if percentage <= 75 {
		status = "on_track"
	} else if percentage <= 100 {
		status = "warning"
	} else {
		status = "exceeded"
	}
	
	// Create the result
	result := map[string]interface{}{
		"budget":         budget,
		"categoryName":   category.Name,
		"totalExpenses":  totalExpenses,
		"remaining":      remaining,
		"usagePercentage": percentage,
		"timeProgress":   timeProgress,
		"status":         status,
	}
	
	return result, nil
}

// Helper function to validate period
func isValidPeriod(period string) bool {
	validPeriods := map[string]bool{
		"daily":   true,
		"weekly":  true,
		"monthly": true,
		"yearly":  true,
	}
	
	return validPeriods[period]
}