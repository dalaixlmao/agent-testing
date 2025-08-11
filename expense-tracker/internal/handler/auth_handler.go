package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/expense-tracker/internal/config"
	"github.com/expense-tracker/internal/middleware"
	"github.com/expense-tracker/internal/model"
	"github.com/expense-tracker/internal/service"
)

// AuthHandler handles authentication requests
type AuthHandler struct {
	userService *service.UserService
	cfg         *config.Config
}

// NewAuthHandler creates a new auth handler
func NewAuthHandler(userService *service.UserService, cfg *config.Config) *AuthHandler {
	return &AuthHandler{
		userService: userService,
		cfg:         cfg,
	}
}

// Register handles user registration
func (h *AuthHandler) Register(c *gin.Context) {
	var req model.AuthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// Validate first name and last name for registration
	if req.FirstName == "" || req.LastName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "firstName and lastName are required for registration"})
		return
	}
	
	// Create user
	user, err := h.userService.Register(c.Request.Context(), req.Email, req.Password, req.FirstName, req.LastName)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// Generate token
	token, err := middleware.GenerateToken(user.ID, h.cfg)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}
	
	c.JSON(http.StatusCreated, model.LoginResponse{
		Token: token,
		User:  *user,
	})
}

// Login handles user login
func (h *AuthHandler) Login(c *gin.Context) {
	var req model.AuthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// Authenticate user
	user, err := h.userService.Authenticate(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}
	
	// Generate token
	token, err := middleware.GenerateToken(user.ID, h.cfg)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}
	
	c.JSON(http.StatusOK, model.LoginResponse{
		Token: token,
		User:  *user,
	})
}

// GetProfile handles getting the user's profile
func (h *AuthHandler) GetProfile(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	
	user, err := h.userService.GetByID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get user profile"})
		return
	}
	
	if user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	
	c.JSON(http.StatusOK, user)
}

// UpdateProfile handles updating the user's profile
func (h *AuthHandler) UpdateProfile(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	
	var req struct {
		FirstName string `json:"firstName" binding:"required"`
		LastName  string `json:"lastName" binding:"required"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	user, err := h.userService.UpdateProfile(c.Request.Context(), userID, req.FirstName, req.LastName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update profile"})
		return
	}
	
	c.JSON(http.StatusOK, user)
}

// ChangePassword handles changing the user's password
func (h *AuthHandler) ChangePassword(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	
	var req struct {
		CurrentPassword string `json:"currentPassword" binding:"required"`
		NewPassword     string `json:"newPassword" binding:"required,min=6"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	err := h.userService.ChangePassword(c.Request.Context(), userID, req.CurrentPassword, req.NewPassword)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	c.Status(http.StatusNoContent)
}

// DeleteAccount handles deleting the user's account
func (h *AuthHandler) DeleteAccount(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	
	err := h.userService.DeleteAccount(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete account"})
		return
	}
	
	c.Status(http.StatusNoContent)
}