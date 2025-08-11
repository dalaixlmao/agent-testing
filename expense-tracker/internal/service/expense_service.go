package service

import (
	"context"
	"errors"
	"time"

	"github.com/expense-tracker/internal/model"
	"github.com/expense-tracker/internal/repository"
	"golang.org/x/sync/errgroup"
)

// ExpenseService handles expense business logic
type ExpenseService struct {
	expenseRepo  *repository.ExpenseRepository
	categoryRepo *repository.CategoryRepository
	budgetRepo   *repository.BudgetRepository
}

// NewExpenseService creates a new expense service
func NewExpenseService(
	expenseRepo *repository.ExpenseRepository,
	categoryRepo *repository.CategoryRepository,
	budgetRepo *repository.BudgetRepository,
) *ExpenseService {
	return &ExpenseService{
		expenseRepo:  expenseRepo,
		categoryRepo: categoryRepo,
		budgetRepo:   budgetRepo,
	}
}

// GetByID fetches an expense by ID
func (s *ExpenseService) GetByID(ctx context.Context, id string, userID string) (*model.Expense, error) {
	expense, err := s.expenseRepo.GetByID(ctx, id, userID)
	if err != nil {
		return nil, err
	}
	
	if expense == nil {
		return nil, errors.New("expense not found")
	}
	
	return expense, nil
}

// GetAllByUserID fetches all expenses for a user with optional filters
func (s *ExpenseService) GetAllByUserID(ctx context.Context, userID string, 
	startDate, endDate *time.Time, categoryID string, limit, offset int) ([]*model.Expense, error) {
	
	// Validate categoryID if provided
	if categoryID != "" {
		category, err := s.categoryRepo.GetByID(ctx, categoryID, userID)
		if err != nil {
			return nil, err
		}
		
		if category == nil {
			return nil, errors.New("category not found")
		}
	}
	
	return s.expenseRepo.GetAllByUserID(ctx, userID, startDate, endDate, categoryID, limit, offset)
}

// Create creates a new expense
func (s *ExpenseService) Create(ctx context.Context, userID, categoryID, description string, amount float64, date time.Time) (*model.Expense, error) {
	// Validate category
	category, err := s.categoryRepo.GetByID(ctx, categoryID, userID)
	if err != nil {
		return nil, err
	}
	
	if category == nil {
		return nil, errors.New("category not found")
	}
	
	// Create the expense
	expense := model.NewExpense(userID, categoryID, amount, description, date)
	err = s.expenseRepo.Create(ctx, expense)
	if err != nil {
		return nil, err
	}
	
	return expense, nil
}

// Update updates an expense
func (s *ExpenseService) Update(ctx context.Context, id, userID, categoryID, description string, 
	amount float64, date time.Time) (*model.Expense, error) {
	
	// Check if expense exists and belongs to the user
	expense, err := s.expenseRepo.GetByID(ctx, id, userID)
	if err != nil {
		return nil, err
	}
	
	if expense == nil {
		return nil, errors.New("expense not found")
	}
	
	// Validate category if changed
	if expense.CategoryID != categoryID {
		category, err := s.categoryRepo.GetByID(ctx, categoryID, userID)
		if err != nil {
			return nil, err
		}
		
		if category == nil {
			return nil, errors.New("category not found")
		}
	}
	
	// Update the expense
	expense.CategoryID = categoryID
	expense.Amount = amount
	expense.Description = description
	expense.Date = date
	
	err = s.expenseRepo.Update(ctx, expense)
	if err != nil {
		return nil, err
	}
	
	return expense, nil
}

// Delete deletes an expense
func (s *ExpenseService) Delete(ctx context.Context, id, userID string) error {
	return s.expenseRepo.Delete(ctx, id, userID)
}

// GetExpenseSummary gets expense summaries with concurrently fetched budget information
func (s *ExpenseService) GetExpenseSummary(ctx context.Context, userID string, 
	startDate, endDate *time.Time) (map[string]interface{}, error) {
	
	// Create a context for the concurrent operations
	g, ctx := errgroup.WithContext(ctx)
	
	var summaries []*model.ExpenseSummary
	var totalAmount float64
	var activeBudgets []*model.Budget
	
	// Fetch summaries by category
	g.Go(func() error {
		var err error
		summaries, err = s.expenseRepo.GetSummaryByCategory(ctx, userID, startDate, endDate)
		return err
	})
	
	// Fetch total amount
	g.Go(func() error {
		var err error
		totalAmount, err = s.expenseRepo.GetTotalAmount(ctx, userID, startDate, endDate, "")
		return err
	})
	
	// Fetch active budgets
	g.Go(func() error {
		var err error
		activeBudgets, err = s.budgetRepo.GetAllByUserID(ctx, userID, true)
		return err
	})
	
	// Wait for all goroutines to complete
	if err := g.Wait(); err != nil {
		return nil, err
	}
	
	// Calculate budget usage
	budgetUsage := make(map[string]map[string]interface{})
	for _, budget := range activeBudgets {
		amount, err := s.expenseRepo.GetTotalAmount(ctx, userID, &budget.StartDate, &budget.EndDate, budget.CategoryID)
		if err != nil {
			return nil, err
		}
		
		category, err := s.categoryRepo.GetByID(ctx, budget.CategoryID, userID)
		if err != nil || category == nil {
			continue
		}
		
		percentage := 0.0
		if budget.Amount > 0 {
			percentage = (amount / budget.Amount) * 100
		}
		
		budgetUsage[budget.CategoryID] = map[string]interface{}{
			"budgetId":       budget.ID,
			"categoryId":     budget.CategoryID,
			"categoryName":   category.Name,
			"budgetAmount":   budget.Amount,
			"spentAmount":    amount,
			"remainingAmount": budget.Amount - amount,
			"usagePercentage": percentage,
		}
	}
	
	// Construct the result
	result := map[string]interface{}{
		"totalAmount": totalAmount,
		"summaries":   summaries,
		"budgetUsage": budgetUsage,
	}
	
	return result, nil
}

// BulkCreateExpenses creates multiple expenses in a batch
func (s *ExpenseService) BulkCreateExpenses(ctx context.Context, userID string, 
	expenses []*model.ExpenseRequest) ([]*model.Expense, []error) {
	
	results := make([]*model.Expense, 0, len(expenses))
	errors := make([]error, 0)
	
	// Use a worker pool pattern to process expenses concurrently
	type workItem struct {
		index   int
		request *model.ExpenseRequest
		result  *model.Expense
		err     error
	}
	
	// Define number of workers
	numWorkers := 5
	if len(expenses) < numWorkers {
		numWorkers = len(expenses)
	}
	
	// Create input and output channels
	jobs := make(chan workItem, len(expenses))
	results2 := make(chan workItem, len(expenses))
	
	// Start workers
	for w := 1; w <= numWorkers; w++ {
		go func() {
			for job := range jobs {
				// Process the expense
				expense, err := s.Create(
					ctx, 
					userID, 
					job.request.CategoryID, 
					job.request.Description, 
					job.request.Amount, 
					job.request.Date,
				)
				
				job.result = expense
				job.err = err
				
				// Send result
				results2 <- job
			}
		}()
	}
	
	// Send jobs
	for i, req := range expenses {
		jobs <- workItem{index: i, request: req}
	}
	close(jobs)
	
	// Collect results
	resultItems := make([]workItem, len(expenses))
	for i := 0; i < len(expenses); i++ {
		item := <-results2
		resultItems[item.index] = item
	}
	
	// Process results in original order
	for _, item := range resultItems {
		if item.err != nil {
			errors = append(errors, item.err)
		} else {
			results = append(results, item.result)
		}
	}
	
	return results, errors
}