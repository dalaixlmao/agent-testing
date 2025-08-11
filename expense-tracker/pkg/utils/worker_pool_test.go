package utils

import (
	"context"
	"errors"
	"strconv"
	"testing"
	"time"
)

// Test processing jobs with success
func TestProcessJobs_Success(t *testing.T) {
	// Create a worker function that squares numbers
	worker := func(ctx context.Context, job int) (int, error) {
		return job * job, nil
	}

	// Create jobs
	jobs := []int{1, 2, 3, 4, 5}

	// Process jobs
	results, err := ProcessJobs(context.Background(), jobs, worker, 2)
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	// Verify results
	if len(results) != len(jobs) {
		t.Fatalf("Expected %d results, got %d", len(jobs), len(results))
	}

	// Results may be in any order due to concurrent execution
	resultMap := make(map[int]bool)
	for _, result := range results {
		if result.Err != nil {
			t.Fatalf("Expected no error in result, got %v", result.Err)
		}
		resultMap[result.Result] = true
	}

	// Check that all expected values are in the result map
	for _, job := range jobs {
		expectedResult := job * job
		if !resultMap[expectedResult] {
			t.Fatalf("Expected result %d not found", expectedResult)
		}
	}
}

// Test processing jobs with errors
func TestProcessJobs_Error(t *testing.T) {
	// Create a worker that returns an error for even numbers
	worker := func(ctx context.Context, job int) (string, error) {
		if job%2 == 0 {
			return "", errors.New("even number error")
		}
		return strconv.Itoa(job), nil
	}

	// Create jobs
	jobs := []int{1, 2, 3, 4, 5}

	// Process jobs
	results, err := ProcessJobs(context.Background(), jobs, worker, 2)
	if err != nil {
		t.Fatalf("Expected no error from ProcessJobs, got %v", err)
	}

	// Count successful and error results
	successCount := 0
	errorCount := 0
	for _, result := range results {
		if result.Err != nil {
			errorCount++
		} else {
			successCount++
		}
	}

	// We should have 3 successful results (1, 3, 5) and 2 errors (2, 4)
	if successCount != 3 {
		t.Errorf("Expected 3 successful results, got %d", successCount)
	}
	if errorCount != 2 {
		t.Errorf("Expected 2 error results, got %d", errorCount)
	}
}

// Test processing ordered jobs
func TestProcessJobsOrdered_Success(t *testing.T) {
	// Create a worker function with varying delays to test ordering
	worker := func(ctx context.Context, job int) (int, error) {
		// Add variable delay to simulate work
		time.Sleep(time.Duration(5-job) * time.Millisecond)
		return job * job, nil
	}

	// Create jobs
	jobs := []int{1, 2, 3, 4, 5}

	// Process jobs with ordering
	results, err := ProcessJobsOrdered(context.Background(), jobs, worker, 2)
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	// Verify results are in the correct order
	if len(results) != len(jobs) {
		t.Fatalf("Expected %d results, got %d", len(jobs), len(results))
	}

	for i, result := range results {
		if result.Err != nil {
			t.Fatalf("Expected no error in result %d, got %v", i, result.Err)
		}

		expectedJob := jobs[i]
		expectedResult := expectedJob * expectedJob

		if result.Job != expectedJob {
			t.Errorf("Expected job %d at position %d, got %d", expectedJob, i, result.Job)
		}

		if result.Result != expectedResult {
			t.Errorf("Expected result %d at position %d, got %d", expectedResult, i, result.Result)
		}
	}
}

// Test cancellation via context
func TestProcessJobs_Cancellation(t *testing.T) {
	// Create a worker function that takes some time
	worker := func(ctx context.Context, job int) (int, error) {
		select {
		case <-ctx.Done():
			return 0, ctx.Err()
		case <-time.After(50 * time.Millisecond):
			return job * job, nil
		}
	}

	// Create jobs
	jobs := []int{1, 2, 3, 4, 5}

	// Create a context that cancels after a short time
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Millisecond)
	defer cancel()

	// Process jobs with a cancellable context
	_, err := ProcessJobs(ctx, jobs, worker, 2)

	// We should get a context deadline exceeded error
	if err == nil || !errors.Is(err, context.DeadlineExceeded) {
		t.Fatalf("Expected context deadline exceeded error, got %v", err)
	}
}