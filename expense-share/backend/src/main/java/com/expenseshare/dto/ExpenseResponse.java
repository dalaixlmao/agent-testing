package com.expenseshare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for expense information in responses.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseResponse {

    private Long id;
    private String description;
    private BigDecimal amount;
    private UserResponse paidBy;
    private List<ShareResponse> shares;
    private LocalDateTime expenseDate;
    private String category;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * DTO for share information within expense response.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ShareResponse {
        private Long id;
        private UserResponse user;
        private BigDecimal shareAmount;
        private Boolean settled;
    }
}
