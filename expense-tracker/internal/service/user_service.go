package service

import (
	"context"
	"errors"
	"time"

	"github.com/expense-tracker/internal/model"
	"github.com/expense-tracker/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

// UserService handles user business logic
type UserService struct {
	userRepo *repository.UserRepository
}

// NewUserService creates a new user service
func NewUserService(userRepo *repository.UserRepository) *UserService {
	return &UserService{
		userRepo: userRepo,
	}
}

// GetByID fetches a user by ID
func (s *UserService) GetByID(ctx context.Context, id string) (*model.User, error) {
	return s.userRepo.GetByID(ctx, id)
}

// Register creates a new user
func (s *UserService) Register(ctx context.Context, email, password, firstName, lastName string) (*model.User, error) {
	// Check if user already exists
	existingUser, err := s.userRepo.GetByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	
	if existingUser != nil {
		return nil, errors.New("email already in use")
	}
	
	// Hash the password
	hashedPassword, err := hashPassword(password)
	if err != nil {
		return nil, err
	}
	
	// Create the user
	user := model.NewUser(email, hashedPassword, firstName, lastName)
	err = s.userRepo.Create(ctx, user)
	if err != nil {
		return nil, err
	}
	
	return user, nil
}

// Authenticate authenticates a user by email and password
func (s *UserService) Authenticate(ctx context.Context, email, password string) (*model.User, error) {
	user, err := s.userRepo.GetByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	
	if user == nil {
		return nil, errors.New("invalid email or password")
	}
	
	// Verify password
	err = comparePasswords(user.Password, password)
	if err != nil {
		return nil, errors.New("invalid email or password")
	}
	
	return user, nil
}

// UpdateProfile updates a user's profile information
func (s *UserService) UpdateProfile(ctx context.Context, id, firstName, lastName string) (*model.User, error) {
	user, err := s.userRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	
	if user == nil {
		return nil, errors.New("user not found")
	}
	
	// Update fields
	user.FirstName = firstName
	user.LastName = lastName
	user.UpdatedAt = time.Now()
	
	err = s.userRepo.Update(ctx, user)
	if err != nil {
		return nil, err
	}
	
	return user, nil
}

// ChangePassword changes a user's password
func (s *UserService) ChangePassword(ctx context.Context, id, currentPassword, newPassword string) error {
	user, err := s.userRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	
	if user == nil {
		return errors.New("user not found")
	}
	
	// Verify current password
	err = comparePasswords(user.Password, currentPassword)
	if err != nil {
		return errors.New("current password is incorrect")
	}
	
	// Hash the new password
	hashedPassword, err := hashPassword(newPassword)
	if err != nil {
		return err
	}
	
	// Update the password
	user.Password = hashedPassword
	user.UpdatedAt = time.Now()
	
	return s.userRepo.Update(ctx, user)
}

// DeleteAccount deletes a user's account
func (s *UserService) DeleteAccount(ctx context.Context, id string) error {
	return s.userRepo.Delete(ctx, id)
}

// Helper functions for password handling

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func comparePasswords(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}