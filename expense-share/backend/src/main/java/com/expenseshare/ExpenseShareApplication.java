package com.expenseshare;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Main application class for Expense Share application.
 * Enables JPA auditing for automatic timestamp management.
 */
@SpringBootApplication
@EnableJpaAuditing
public class ExpenseShareApplication {

    public static void main(String[] args) {
        SpringApplication.run(ExpenseShareApplication.class, args);
    }
}
