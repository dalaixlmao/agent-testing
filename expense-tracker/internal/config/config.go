package config

import (
	"encoding/json"
	"fmt"
	"os"
	"sync"
)

// Config holds all application configuration
type Config struct {
	Server struct {
		Port          string `json:"port"`
		ReadTimeout   int    `json:"readTimeout"`
		WriteTimeout  int    `json:"writeTimeout"`
		IdleTimeout   int    `json:"idleTimeout"`
		AllowedOrigin string `json:"allowedOrigin"`
	} `json:"server"`
	Database struct {
		Driver           string `json:"driver"`
		ConnectionString string `json:"connectionString"`
		MaxOpenConns     int    `json:"maxOpenConns"`
		MaxIdleConns     int    `json:"maxIdleConns"`
		ConnMaxLifetime  int    `json:"connMaxLifetime"`
	} `json:"database"`
	Auth struct {
		JwtSecret        string `json:"jwtSecret"`
		TokenExpiryHours int    `json:"tokenExpiryHours"`
	} `json:"auth"`
}

var (
	instance *Config
	once     sync.Once
)

// Load loads configuration from a file
func Load(path string) (*Config, error) {
	once.Do(func() {
		instance = &Config{}

		// Set defaults
		instance.Server.Port = "8080"
		instance.Server.ReadTimeout = 10  // seconds
		instance.Server.WriteTimeout = 10 // seconds
		instance.Server.IdleTimeout = 60  // seconds
		instance.Server.AllowedOrigin = "*"

		instance.Database.Driver = "sqlite3"
		instance.Database.ConnectionString = "./expense_tracker.db"
		instance.Database.MaxOpenConns = 10
		instance.Database.MaxIdleConns = 5
		instance.Database.ConnMaxLifetime = 300 // seconds

		instance.Auth.JwtSecret = "default-secret-change-in-production"
		instance.Auth.TokenExpiryHours = 24

		// If config file exists, override defaults with file values
		if path != "" {
			// Check if file exists
			if _, err := os.Stat(path); err == nil {
				file, err := os.Open(path)
				if err != nil {
					fmt.Printf("Error opening config file: %v\n", err)
					return
				}
				defer file.Close()

				decoder := json.NewDecoder(file)
				err = decoder.Decode(&instance)
				if err != nil {
					fmt.Printf("Error decoding config file: %v\n", err)
				}
			}
		}

		// Override with environment variables if they exist
		if port := os.Getenv("SERVER_PORT"); port != "" {
			instance.Server.Port = port
		}

		if dbConn := os.Getenv("DB_CONNECTION_STRING"); dbConn != "" {
			instance.Database.ConnectionString = dbConn
		}

		if jwtSecret := os.Getenv("JWT_SECRET"); jwtSecret != "" {
			instance.Auth.JwtSecret = jwtSecret
		}
	})

	return instance, nil
}

// Get returns the singleton config instance
func Get() *Config {
	if instance == nil {
		_, _ = Load("")
	}
	return instance
}