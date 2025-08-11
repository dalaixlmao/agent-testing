package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/expense-tracker/internal/middleware"
	"github.com/expense-tracker/internal/model"
	"github.com/expense-tracker/internal/service"
)

// ExpenseHandler handles expense requests
type ExpenseHandler struct {
	expenseService *service.ExpenseService
}

// NewExpenseHandler creates a new expense handler
func NewExpenseHandler(expenseService *service.ExpenseService) *ExpenseHandler {
	return &ExpenseHandler{
		expenseService: expenseService,
	}
}

// GetAll returns all expenses for the current user with optional filters
func (h *ExpenseHandler) GetAll(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	
	// Parse query parameters
	var startDate, endDate *time.Time
	if startDateStr := c.Query("startDate"); startDateStr != "" {
		date, err := time.Parse("2006-01-02", startDateStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid startDate format, use YYYY-MM-DD"})
			return
		}
		startDate = &date
	}
	
	if endDateStr := c.Query("endDate"); endDateStr != "" {
		date, err := time.Parse("2006-01-02", endDateStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid endDate format, use YYYY-MM-DD"})
			return
		}
		// Set time to end of day
		date = date.Add(23*time.Hour + 59*time.Minute + 59*time.Second)
		endDate = &date
	}
	
	categoryID := c.Query("categoryId")
	
	// Parse pagination parameters
	limit := 100 // Default limit
	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}
	
	offset := 0 // Default offset
	if offsetStr := c.Query("offset"); offsetStr != "" {
		if o, err := strconv.Atoi(offsetStr); err == nil && o >= 0 {
			offset = o
		}
	}
	
	// Get expenses
	expenses, err := h.expenseService.GetAllByUserID(
		c.Request.Context(), userID, startDate, endDate, categoryID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get expenses"})
		return
	}
	
	c.JSON(http.StatusOK, expenses)
}

// GetByID returns a specific expense
func (h *ExpenseHandler) GetByID(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	expenseID := c.Param("id")
	
	expense, err := h.expenseService.GetByID(c.Request.Context(), expenseID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, expense)
}

// Create creates a new expense
func (h *ExpenseHandler) Create(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	
	var req model.ExpenseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	expense, err := h.expenseService.Create(
		c.Request.Context(), 
		userID, 
		req.CategoryID, 
		req.Description, 
		req.Amount, 
		req.Date,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusCreated, expense)
}

// Update updates an expense
func (h *ExpenseHandler) Update(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	expenseID := c.Param("id")
	
	var req model.ExpenseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	expense, err := h.expenseService.Update(
		c.Request.Context(), 
		expenseID, 
		userID, 
		req.CategoryID, 
		req.Description, 
		req.Amount, 
		req.Date,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, expense)
}

// Delete deletes an expense
func (h *ExpenseHandler) Delete(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	expenseID := c.Param("id")
	
	err := h.expenseService.Delete(c.Request.Context(), expenseID, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	c.Status(http.StatusNoContent)
}

// GetSummary returns expense summaries
func (h *ExpenseHandler) GetSummary(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	
	// Parse query parameters for date range
	var startDate, endDate *time.Time
	if startDateStr := c.Query("startDate"); startDateStr != "" {
		date, err := time.Parse("2006-01-02", startDateStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid startDate format, use YYYY-MM-DD"})
			return
		}
		startDate = &date
	}
	
	if endDateStr := c.Query("endDate"); endDateStr != "" {
		date, err := time.Parse("2006-01-02", endDateStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid endDate format, use YYYY-MM-DD"})
			return
		}
		// Set time to end of day
		date = date.Add(23*time.Hour + 59*time.Minute + 59*time.Second)
		endDate = &date
	}
	
	// Get summary
	summary, err := h.expenseService.GetExpenseSummary(c.Request.Context(), userID, startDate, endDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get expense summary"})
		return
	}
	
	c.JSON(http.StatusOK, summary)
}

// BulkCreate creates multiple expenses in a batch
func (h *ExpenseHandler) BulkCreate(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	
	var reqs []model.ExpenseRequest
	if err := c.ShouldBindJSON(&reqs); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// Limit the number of expenses to create at once
	if len(reqs) > 100 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "maximum 100 expenses can be created at once"})
		return
	}
	
	// Create expenses
	expenses, errors := h.expenseService.BulkCreateExpenses(c.Request.Context(), userID, reqs)
	
	// Prepare response
	response := gin.H{
		"created": expenses,
		"total":   len(reqs),
		"success": len(expenses),
		"failed":  len(errors),
	}
	
	if len(errors) > 0 {
		errorMessages := make([]string, len(errors))
		for i, err := range errors {
			errorMessages[i] = err.Error()
		}
		response["errors"] = errorMessages
	}
	
	c.JSON(http.StatusOK, response)
}