package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"github.com/expense-tracker/internal/config"
	"github.com/expense-tracker/internal/handler"
	"github.com/expense-tracker/internal/middleware"
	"github.com/expense-tracker/internal/repository"
	"github.com/expense-tracker/internal/service"
)

func main() {
	// Load configuration
	cfg, err := config.Load("./config.json")
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Setup database
	db, err := setupDatabase(cfg)
	if err != nil {
		log.Fatalf("Failed to setup database: %v", err)
	}
	defer db.Close()

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	categoryRepo := repository.NewCategoryRepository(db)
	expenseRepo := repository.NewExpenseRepository(db)
	budgetRepo := repository.NewBudgetRepository(db)

	// Initialize services
	userService := service.NewUserService(userRepo)
	categoryService := service.NewCategoryService(categoryRepo)
	expenseService := service.NewExpenseService(expenseRepo, categoryRepo, budgetRepo)
	budgetService := service.NewBudgetService(budgetRepo, categoryRepo, expenseRepo)

	// Initialize handlers
	authHandler := handler.NewAuthHandler(userService, cfg)
	categoryHandler := handler.NewCategoryHandler(categoryService)
	expenseHandler := handler.NewExpenseHandler(expenseService)
	budgetHandler := handler.NewBudgetHandler(budgetService)

	// Setup router
	router := setupRouter(cfg, authHandler, categoryHandler, expenseHandler, budgetHandler)

	// Start server
	srv := &http.Server{
		Addr:         ":" + cfg.Server.Port,
		Handler:      router,
		ReadTimeout:  time.Duration(cfg.Server.ReadTimeout) * time.Second,
		WriteTimeout: time.Duration(cfg.Server.WriteTimeout) * time.Second,
		IdleTimeout:  time.Duration(cfg.Server.IdleTimeout) * time.Second,
	}

	// Create a WaitGroup to manage graceful shutdown
	var wg sync.WaitGroup
	wg.Add(1)

	// Start server in a goroutine
	go func() {
		defer wg.Done()
		log.Printf("Server starting on port %s", cfg.Server.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	// Create a deadline to wait for.
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Doesn't block if no connections, but will otherwise wait until the timeout
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	wg.Wait()
	log.Println("Server exiting")
}

// setupDatabase initializes the database connection and schema
func setupDatabase(cfg *config.Config) (*repository.Database, error) {
	db, err := repository.NewDatabase(cfg)
	if err != nil {
		return nil, err
	}

	// Initialize schema
	err = db.InitSchema()
	if err != nil {
		return nil, fmt.Errorf("failed to initialize schema: %w", err)
	}

	return db, nil
}

// setupRouter configures and returns the API router
func setupRouter(
	cfg *config.Config,
	authHandler *handler.AuthHandler,
	categoryHandler *handler.CategoryHandler,
	expenseHandler *handler.ExpenseHandler,
	budgetHandler *handler.BudgetHandler,
) *gin.Engine {
	router := gin.Default()

	// Configure CORS
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = []string{cfg.Server.AllowedOrigin}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	corsConfig.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	router.Use(cors.New(corsConfig))

	// Create API routes
	api := router.Group("/api")

	// Public routes
	api.POST("/auth/register", authHandler.Register)
	api.POST("/auth/login", authHandler.Login)

	// Protected routes
	protected := api.Group("", middleware.AuthMiddleware(cfg), middleware.RequireAuth())

	// User routes
	protected.GET("/profile", authHandler.GetProfile)
	protected.PUT("/profile", authHandler.UpdateProfile)
	protected.PUT("/profile/password", authHandler.ChangePassword)
	protected.DELETE("/profile", authHandler.DeleteAccount)

	// Category routes
	protected.GET("/categories", categoryHandler.GetAll)
	protected.GET("/categories/:id", categoryHandler.GetByID)
	protected.POST("/categories", categoryHandler.Create)
	protected.PUT("/categories/:id", categoryHandler.Update)
	protected.DELETE("/categories/:id", categoryHandler.Delete)

	// Expense routes
	protected.GET("/expenses", expenseHandler.GetAll)
	protected.GET("/expenses/:id", expenseHandler.GetByID)
	protected.POST("/expenses", expenseHandler.Create)
	protected.POST("/expenses/bulk", expenseHandler.BulkCreate)
	protected.PUT("/expenses/:id", expenseHandler.Update)
	protected.DELETE("/expenses/:id", expenseHandler.Delete)
	protected.GET("/expenses/summary", expenseHandler.GetSummary)

	// Budget routes
	protected.GET("/budgets", budgetHandler.GetAll)
	protected.GET("/budgets/:id", budgetHandler.GetByID)
	protected.GET("/budgets/:id/status", budgetHandler.GetBudgetStatus)
	protected.POST("/budgets", budgetHandler.Create)
	protected.PUT("/budgets/:id", budgetHandler.Update)
	protected.DELETE("/budgets/:id", budgetHandler.Delete)

	return router
}