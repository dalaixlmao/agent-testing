package middleware

import (
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"

	"github.com/expense-tracker/internal/config"
)

// Claims represents JWT claims
type Claims struct {
	UserID string `json:"userId"`
	jwt.RegisteredClaims
}

// GenerateToken generates a JWT token for a user
func GenerateToken(userID string, cfg *config.Config) (string, error) {
	// Set expiration time
	expirationTime := time.Now().Add(time.Duration(cfg.Auth.TokenExpiryHours) * time.Hour)
	
	// Create claims
	claims := &Claims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "expense-tracker",
			Subject:   userID,
		},
	}
	
	// Create token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	
	// Sign token
	tokenString, err := token.SignedString([]byte(cfg.Auth.JwtSecret))
	if err != nil {
		return "", err
	}
	
	return tokenString, nil
}

// AuthMiddleware is a middleware to authenticate requests
func AuthMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "authorization header is required"})
			return
		}
		
		// Check if authorization header has correct format
		parts := strings.SplitN(authHeader, " ", 2)
		if !(len(parts) == 2 && parts[0] == "Bearer") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "authorization header format must be Bearer {token}"})
			return
		}
		
		// Extract token
		tokenString := parts[1]
		
		// Parse token
		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			// Validate signing method
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			
			return []byte(cfg.Auth.JwtSecret), nil
		})
		
		if err != nil {
			var validationError *jwt.ValidationError
			if errors.As(err, &validationError) {
				if validationError.Errors&jwt.ValidationErrorExpired != 0 {
					c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "token has expired"})
					return
				}
			}
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}
		
		if !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}
		
		// Set user ID in context
		c.Set("userID", claims.UserID)
		
		c.Next()
	}
}

// GetUserID gets the user ID from the context
func GetUserID(c *gin.Context) (string, bool) {
	userID, exists := c.Get("userID")
	if !exists {
		return "", false
	}
	
	userIDStr, ok := userID.(string)
	if !ok {
		return "", false
	}
	
	return userIDStr, true
}

// RequireAuth ensures the request is authenticated
func RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		_, exists := GetUserID(c)
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "authentication required"})
			return
		}
		
		c.Next()
	}
}