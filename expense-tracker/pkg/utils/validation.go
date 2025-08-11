package utils

import (
	"errors"
	"fmt"
	"regexp"
	"time"
)

// ValidateEmail validates an email address
func ValidateEmail(email string) error {
	// Simple regex for email validation
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(email) {
		return errors.New("invalid email address format")
	}
	return nil
}

// ValidatePassword checks if a password meets minimum requirements
func ValidatePassword(password string) error {
	if len(password) < 6 {
		return errors.New("password must be at least 6 characters")
	}
	
	// Check for at least one number
	hasNumber := regexp.MustCompile(`[0-9]`).MatchString(password)
	if !hasNumber {
		return errors.New("password must contain at least one number")
	}
	
	return nil
}

// ValidateAmount validates a monetary amount
func ValidateAmount(amount float64) error {
	if amount <= 0 {
		return errors.New("amount must be greater than zero")
	}
	return nil
}

// ValidateDateRange validates a date range
func ValidateDateRange(startDate, endDate time.Time) error {
	if startDate.IsZero() || endDate.IsZero() {
		return errors.New("start and end dates must be provided")
	}
	
	if startDate.After(endDate) {
		return errors.New("start date must be before end date")
	}
	
	return nil
}

// ValidateBudgetPeriod validates a budget period
func ValidateBudgetPeriod(period string) error {
	validPeriods := map[string]bool{
		"daily":   true,
		"weekly":  true,
		"monthly": true,
		"yearly":  true,
	}
	
	if !validPeriods[period] {
		return fmt.Errorf("invalid budget period: %s, must be one of: daily, weekly, monthly, yearly", period)
	}
	
	return nil
}

// SanitizeString removes potentially dangerous characters from a string
func SanitizeString(input string) string {
	// This is a very simple sanitization - in a production app you'd want more robust handling
	re := regexp.MustCompile(`[^\p{L}\p{N}\s\-_,.]`)
	return re.ReplaceAllString(input, "")
}