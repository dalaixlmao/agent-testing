package com.expenseshare.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for creating or updating an expense.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseRequest {

    @NotBlank
    private String description;

    @NotNull
    @Positive
    private BigDecimal amount;

    @NotNull
    private LocalDateTime expenseDate;

    private String category;

    private String notes;

    @NotEmpty
    private List<ShareDetail> shares;

    /**
     * Details of how the expense is split.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShareDetail {
        @NotNull
        private Long userId;

        @NotNull
        @Positive
        private BigDecimal shareAmount;
    }
}
