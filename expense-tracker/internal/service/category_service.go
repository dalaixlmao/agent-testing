package service

import (
	"context"
	"errors"

	"github.com/expense-tracker/internal/model"
	"github.com/expense-tracker/internal/repository"
)

// CategoryService handles category business logic
type CategoryService struct {
	categoryRepo *repository.CategoryRepository
}

// NewCategoryService creates a new category service
func NewCategoryService(categoryRepo *repository.CategoryRepository) *CategoryService {
	return &CategoryService{
		categoryRepo: categoryRepo,
	}
}

// GetByID fetches a category by ID
func (s *CategoryService) GetByID(ctx context.Context, id string, userID string) (*model.Category, error) {
	category, err := s.categoryRepo.GetByID(ctx, id, userID)
	if err != nil {
		return nil, err
	}
	
	if category == nil {
		return nil, errors.New("category not found")
	}
	
	return category, nil
}

// GetAllByUserID fetches all categories for a user
func (s *CategoryService) GetAllByUserID(ctx context.Context, userID string) ([]*model.Category, error) {
	return s.categoryRepo.GetAllByUserID(ctx, userID)
}

// Create creates a new category
func (s *CategoryService) Create(ctx context.Context, userID, name, description string) (*model.Category, error) {
	// Create the category
	category := model.NewCategory(userID, name, description)
	err := s.categoryRepo.Create(ctx, category)
	if err != nil {
		return nil, err
	}
	
	return category, nil
}

// Update updates a category
func (s *CategoryService) Update(ctx context.Context, id, userID, name, description string) (*model.Category, error) {
	// Check if category exists and belongs to the user
	category, err := s.categoryRepo.GetByID(ctx, id, userID)
	if err != nil {
		return nil, err
	}
	
	if category == nil {
		return nil, errors.New("category not found")
	}
	
	// Update the category
	category.Name = name
	category.Description = description
	
	err = s.categoryRepo.Update(ctx, category)
	if err != nil {
		return nil, err
	}
	
	return category, nil
}

// Delete deletes a category
func (s *CategoryService) Delete(ctx context.Context, id, userID string) error {
	return s.categoryRepo.Delete(ctx, id, userID)
}