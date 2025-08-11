package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/expense-tracker/internal/middleware"
	"github.com/expense-tracker/internal/model"
	"github.com/expense-tracker/internal/service"
)

// CategoryHandler handles category requests
type CategoryHandler struct {
	categoryService *service.CategoryService
}

// NewCategoryHandler creates a new category handler
func NewCategoryHandler(categoryService *service.CategoryService) *CategoryHandler {
	return &CategoryHandler{
		categoryService: categoryService,
	}
}

// GetAll returns all categories for the current user
func (h *CategoryHandler) GetAll(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	
	categories, err := h.categoryService.GetAllByUserID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get categories"})
		return
	}
	
	c.JSON(http.StatusOK, categories)
}

// GetByID returns a specific category
func (h *CategoryHandler) GetByID(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	categoryID := c.Param("id")
	
	category, err := h.categoryService.GetByID(c.Request.Context(), categoryID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, category)
}

// Create creates a new category
func (h *CategoryHandler) Create(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	
	var req model.CategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	category, err := h.categoryService.Create(c.Request.Context(), userID, req.Name, req.Description)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create category"})
		return
	}
	
	c.JSON(http.StatusCreated, category)
}

// Update updates a category
func (h *CategoryHandler) Update(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	categoryID := c.Param("id")
	
	var req model.CategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	category, err := h.categoryService.Update(c.Request.Context(), categoryID, userID, req.Name, req.Description)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, category)
}

// Delete deletes a category
func (h *CategoryHandler) Delete(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	categoryID := c.Param("id")
	
	err := h.categoryService.Delete(c.Request.Context(), categoryID, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	c.Status(http.StatusNoContent)
}