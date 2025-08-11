package utils

import (
	"fmt"
	"log"
	"os"
	"sync"
	"time"
)

// LogLevel defines the severity of log messages
type LogLevel int

const (
	// DEBUG level for detailed information
	DEBUG LogLevel = iota
	// INFO level for general operational information
	INFO
	// WARNING level for issues that might cause problems
	WARNING
	// ERROR level for errors that might still allow the application to continue running
	ERROR
	// FATAL level for severe errors that cause the application to terminate
	FATAL
)

// String returns the string representation of the log level
func (l LogLevel) String() string {
	return [...]string{"DEBUG", "INFO", "WARNING", "ERROR", "FATAL"}[l]
}

// Logger is a thread-safe logger
type Logger struct {
	level     LogLevel
	output    *log.Logger
	mu        sync.Mutex
	appName   string
	component string
}

// NewLogger creates a new logger instance
func NewLogger(appName, component string, level LogLevel) *Logger {
	return &Logger{
		level:     level,
		output:    log.New(os.Stdout, "", 0),
		appName:   appName,
		component: component,
	}
}

// SetLevel changes the current log level
func (l *Logger) SetLevel(level LogLevel) {
	l.mu.Lock()
	defer l.mu.Unlock()
	l.level = level
}

// SetOutput changes the output destination
func (l *Logger) SetOutput(file *os.File) {
	l.mu.Lock()
	defer l.mu.Unlock()
	l.output = log.New(file, "", 0)
}

// log formats and writes a log message if the level is sufficient
func (l *Logger) log(level LogLevel, format string, v ...interface{}) {
	l.mu.Lock()
	defer l.mu.Unlock()
	
	if level < l.level {
		return
	}
	
	now := time.Now().Format("2006-01-02 15:04:05.000")
	prefix := fmt.Sprintf("[%s] [%s] [%s] [%s] ", now, l.appName, l.component, level.String())
	message := fmt.Sprintf(format, v...)
	l.output.Print(prefix + message)
	
	// If this is a fatal message, exit after logging
	if level == FATAL {
		os.Exit(1)
	}
}

// Debug logs a debug message
func (l *Logger) Debug(format string, v ...interface{}) {
	l.log(DEBUG, format, v...)
}

// Info logs an info message
func (l *Logger) Info(format string, v ...interface{}) {
	l.log(INFO, format, v...)
}

// Warning logs a warning message
func (l *Logger) Warning(format string, v ...interface{}) {
	l.log(WARNING, format, v...)
}

// Error logs an error message
func (l *Logger) Error(format string, v ...interface{}) {
	l.log(ERROR, format, v...)
}

// Fatal logs a fatal message and exits
func (l *Logger) Fatal(format string, v ...interface{}) {
	l.log(FATAL, format, v...)
}