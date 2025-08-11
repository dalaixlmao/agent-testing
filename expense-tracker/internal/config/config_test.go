package config

import (
	"os"
	"testing"
)

func TestConfigDefaults(t *testing.T) {
	// Reset singleton for test
	instance = nil

	cfg, err := Load("")
	if err != nil {
		t.Fatalf("Failed to load default config: %v", err)
	}

	// Test default values
	if cfg.Server.Port != "8080" {
		t.Errorf("Expected default port to be 8080, got %s", cfg.Server.Port)
	}

	if cfg.Database.Driver != "sqlite3" {
		t.Errorf("Expected default driver to be sqlite3, got %s", cfg.Database.Driver)
	}

	if cfg.Auth.TokenExpiryHours != 24 {
		t.Errorf("Expected default token expiry to be 24 hours, got %d", cfg.Auth.TokenExpiryHours)
	}
}

func TestConfigEnvironmentOverride(t *testing.T) {
	// Reset singleton for test
	instance = nil

	// Set environment variables
	os.Setenv("SERVER_PORT", "9090")
	os.Setenv("DB_CONNECTION_STRING", "test.db")
	os.Setenv("JWT_SECRET", "test-secret")

	// Clean up after test
	defer func() {
		os.Unsetenv("SERVER_PORT")
		os.Unsetenv("DB_CONNECTION_STRING")
		os.Unsetenv("JWT_SECRET")
	}()

	cfg, err := Load("")
	if err != nil {
		t.Fatalf("Failed to load config: %v", err)
	}

	// Test environment variable overrides
	if cfg.Server.Port != "9090" {
		t.Errorf("Expected port to be 9090 from env var, got %s", cfg.Server.Port)
	}

	if cfg.Database.ConnectionString != "test.db" {
		t.Errorf("Expected connection string to be test.db from env var, got %s", cfg.Database.ConnectionString)
	}

	if cfg.Auth.JwtSecret != "test-secret" {
		t.Errorf("Expected JWT secret to be test-secret from env var, got %s", cfg.Auth.JwtSecret)
	}
}

func TestGetConfig(t *testing.T) {
	// Reset singleton for test
	instance = nil

	// Get config once
	cfg1 := Get()
	if cfg1 == nil {
		t.Fatal("Expected config instance, got nil")
	}

	// Get config again, should be same instance
	cfg2 := Get()
	if cfg1 != cfg2 {
		t.Error("Expected same config instance from Get() calls")
	}
}