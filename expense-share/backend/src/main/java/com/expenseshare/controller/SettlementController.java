package com.expenseshare.controller;

import com.expenseshare.dto.SettlementResponse;
import com.expenseshare.service.SettlementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for settlement endpoints.
 */
@RestController
@RequestMapping("/api/settlements")
public class SettlementController {

    @Autowired
    private SettlementService settlementService;

    /**
     * Get all settlements for current user.
     */
    @GetMapping
    public ResponseEntity<List<SettlementResponse>> getSettlements() {
        List<SettlementResponse> settlements = settlementService.calculateSettlements();
        return ResponseEntity.ok(settlements);
    }

    /**
     * Get all settlements (admin view).
     */
    @GetMapping("/all")
    public ResponseEntity<List<SettlementResponse>> getAllSettlements() {
        List<SettlementResponse> settlements = settlementService.calculateAllSettlements();
        return ResponseEntity.ok(settlements);
    }

    /**
     * Get settlement between current user and another user.
     */
    @GetMapping("/with/{userId}")
    public ResponseEntity<SettlementResponse> getSettlementWithUser(@PathVariable Long userId) {
        SettlementResponse settlement = settlementService.calculateSettlementBetweenUsers(userId);
        return ResponseEntity.ok(settlement);
    }
}
