package utils

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

// PaginationParams holds pagination parameters
type PaginationParams struct {
	Page     int
	PageSize int
	Offset   int
}

// DefaultPageSize is the default number of items per page
const DefaultPageSize = 20

// MaxPageSize is the maximum allowed page size
const MaxPageSize = 100

// ExtractPaginationParams extracts pagination parameters from a Gin context
func ExtractPaginationParams(c *gin.Context) PaginationParams {
	// Default values
	page := 1
	pageSize := DefaultPageSize
	
	// Parse page parameter
	if pageStr := c.Query("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}
	
	// Parse page size parameter
	if pageSizeStr := c.Query("pageSize"); pageSizeStr != "" {
		if ps, err := strconv.Atoi(pageSizeStr); err == nil && ps > 0 {
			pageSize = ps
			// Limit page size to maximum
			if pageSize > MaxPageSize {
				pageSize = MaxPageSize
			}
		}
	}
	
	// Calculate offset
	offset := (page - 1) * pageSize
	
	return PaginationParams{
		Page:     page,
		PageSize: pageSize,
		Offset:   offset,
	}
}

// PaginationResponse represents a paginated response
type PaginationResponse struct {
	Data       interface{} `json:"data"`
	Pagination struct {
		Page       int `json:"page"`
		PageSize   int `json:"pageSize"`
		TotalItems int `json:"totalItems"`
		TotalPages int `json:"totalPages"`
	} `json:"pagination"`
}

// NewPaginationResponse creates a new paginated response
func NewPaginationResponse(data interface{}, params PaginationParams, totalItems int) PaginationResponse {
	totalPages := (totalItems + params.PageSize - 1) / params.PageSize
	if totalPages < 1 {
		totalPages = 1
	}
	
	response := PaginationResponse{
		Data: data,
	}
	response.Pagination.Page = params.Page
	response.Pagination.PageSize = params.PageSize
	response.Pagination.TotalItems = totalItems
	response.Pagination.TotalPages = totalPages
	
	return response
}