package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/expense-tracker/internal/middleware"
	"github.com/expense-tracker/internal/model"
	"github.com/expense-tracker/internal/service"
)

// BudgetHandler handles budget requests
type BudgetHandler struct {
	budgetService *service.BudgetService
}

// NewBudgetHandler creates a new budget handler
func NewBudgetHandler(budgetService *service.BudgetService) *BudgetHandler {
	return &BudgetHandler{
		budgetService: budgetService,
	}
}

// GetAll returns all budgets for the current user
func (h *BudgetHandler) GetAll(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	
	// Parse active parameter
	active := false
	if activeStr := c.Query("active"); activeStr != "" {
		if a, err := strconv.ParseBool(activeStr); err == nil {
			active = a
		}
	}
	
	budgets, err := h.budgetService.GetAllByUserID(c.Request.Context(), userID, active)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get budgets"})
		return
	}
	
	c.JSON(http.StatusOK, budgets)
}

// GetByID returns a specific budget
func (h *BudgetHandler) GetByID(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	budgetID := c.Param("id")
	
	budget, err := h.budgetService.GetByID(c.Request.Context(), budgetID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, budget)
}

// GetBudgetStatus returns the status of a specific budget
func (h *BudgetHandler) GetBudgetStatus(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	budgetID := c.Param("id")
	
	status, err := h.budgetService.GetBudgetStatus(c.Request.Context(), budgetID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, status)
}

// Create creates a new budget
func (h *BudgetHandler) Create(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	
	var req model.BudgetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	budget, err := h.budgetService.Create(
		c.Request.Context(), 
		userID, 
		req.CategoryID, 
		req.Amount, 
		req.Period, 
		req.StartDate, 
		req.EndDate,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusCreated, budget)
}

// Update updates a budget
func (h *BudgetHandler) Update(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	budgetID := c.Param("id")
	
	var req model.BudgetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	budget, err := h.budgetService.Update(
		c.Request.Context(), 
		budgetID, 
		userID, 
		req.CategoryID, 
		req.Amount, 
		req.Period, 
		req.StartDate, 
		req.EndDate,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, budget)
}

// Delete deletes a budget
func (h *BudgetHandler) Delete(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	budgetID := c.Param("id")
	
	err := h.budgetService.Delete(c.Request.Context(), budgetID, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	c.Status(http.StatusNoContent)
}