package com.expenseshare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO representing a settlement between two users.
 * Indicates who owes whom and how much.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SettlementResponse {

    private UserResponse from;
    private UserResponse to;
    private BigDecimal amount;

    /**
     * Helper method to create a reverse settlement.
     */
    public SettlementResponse reverse() {
        return SettlementResponse.builder()
            .from(this.to)
            .to(this.from)
            .amount(this.amount)
            .build();
    }
}
