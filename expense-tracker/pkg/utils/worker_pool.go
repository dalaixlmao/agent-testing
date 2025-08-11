package utils

import (
	"context"
	"sync"

	"golang.org/x/sync/errgroup"
)

// Worker represents a function that processes a job
type Worker[T, R any] func(ctx context.Context, job T) (R, error)

// Result represents the result of a job
type Result[T, R any] struct {
	Job    T
	Result R
	Err    error
}

// ProcessJobs processes jobs using a worker pool pattern
func ProcessJobs[T, R any](
	ctx context.Context,
	jobs []T,
	worker Worker[T, R],
	numWorkers int,
) ([]Result[T, R], error) {
	// If jobs is empty, return immediately
	if len(jobs) == 0 {
		return []Result[T, R]{}, nil
	}

	// Determine number of workers (don't create more workers than jobs)
	if numWorkers <= 0 || numWorkers > len(jobs) {
		numWorkers = len(jobs)
	}

	// Create an error group with the parent context
	g, ctx := errgroup.WithContext(ctx)

	// Create job and result channels
	jobChan := make(chan T, len(jobs))
	resultChan := make(chan Result[T, R], len(jobs))

	// Start workers
	for i := 0; i < numWorkers; i++ {
		g.Go(func() error {
			for job := range jobChan {
				// Check if context has been canceled
				if ctx.Err() != nil {
					return ctx.Err()
				}

				// Process the job
				result, err := worker(ctx, job)
				resultChan <- Result[T, R]{
					Job:    job,
					Result: result,
					Err:    err,
				}

				// If there was an error and we want to fail fast, return the error
				if err != nil && ctx.Err() != nil {
					return err
				}
			}
			return nil
		})
	}

	// Send all jobs to workers
	for _, job := range jobs {
		jobChan <- job
	}
	close(jobChan)

	// Collect results in a separate goroutine
	results := make([]Result[T, R], len(jobs))
	var wg sync.WaitGroup
	wg.Add(1)
	go func() {
		defer wg.Done()
		for i := 0; i < len(jobs); i++ {
			select {
			case <-ctx.Done():
				return
			case result := <-resultChan:
				results[i] = result
			}
		}
	}()

	// Wait for all workers to complete
	err := g.Wait()

	// Wait for results collection to complete
	wg.Wait()

	return results, err
}

// ProcessJobsOrdered processes jobs in order and returns results in the same order
func ProcessJobsOrdered[T, R any](
	ctx context.Context,
	jobs []T,
	worker Worker[T, R],
	numWorkers int,
) ([]Result[T, R], error) {
	// If jobs is empty, return immediately
	if len(jobs) == 0 {
		return []Result[T, R]{}, nil
	}

	// Determine number of workers (don't create more workers than jobs)
	if numWorkers <= 0 || numWorkers > len(jobs) {
		numWorkers = len(jobs)
	}

	// Create a wrapper that includes the job index
	type indexedJob struct {
		index int
		job   T
	}

	type indexedResult struct {
		index  int
		result R
		err    error
	}

	// Create an error group with the parent context
	g, ctx := errgroup.WithContext(ctx)

	// Create job and result channels
	jobChan := make(chan indexedJob, len(jobs))
	resultChan := make(chan indexedResult, len(jobs))

	// Start workers
	for i := 0; i < numWorkers; i++ {
		g.Go(func() error {
			for indexed := range jobChan {
				// Check if context has been canceled
				if ctx.Err() != nil {
					return ctx.Err()
				}

				// Process the job
				result, err := worker(ctx, indexed.job)
				resultChan <- indexedResult{
					index:  indexed.index,
					result: result,
					err:    err,
				}

				// If there was an error and we want to fail fast, return the error
				if err != nil && ctx.Err() != nil {
					return err
				}
			}
			return nil
		})
	}

	// Send all jobs to workers with their index
	for i, job := range jobs {
		jobChan <- indexedJob{
			index: i,
			job:   job,
		}
	}
	close(jobChan)

	// Collect results
	indexedResults := make([]indexedResult, len(jobs))
	var wg sync.WaitGroup
	wg.Add(1)
	go func() {
		defer wg.Done()
		for i := 0; i < len(jobs); i++ {
			select {
			case <-ctx.Done():
				return
			case result := <-resultChan:
				indexedResults[i] = result
			}
		}
	}()

	// Wait for all workers to complete
	err := g.Wait()

	// Wait for results collection to complete
	wg.Wait()

	// Re-order results based on job index
	results := make([]Result[T, R], len(jobs))
	for _, ir := range indexedResults {
		results[ir.index] = Result[T, R]{
			Job:    jobs[ir.index],
			Result: ir.result,
			Err:    ir.err,
		}
	}

	return results, err
}