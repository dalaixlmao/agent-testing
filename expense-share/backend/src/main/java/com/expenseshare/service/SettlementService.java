package com.expenseshare.service;

import com.expenseshare.dto.SettlementResponse;
import com.expenseshare.entity.Expense;
import com.expenseshare.entity.ExpenseShare;
import com.expenseshare.entity.User;
import com.expenseshare.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for settlement calculations.
 * Implements the debt simplification algorithm to minimize transactions.
 */
@Service
public class SettlementService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private UserService userService;

    /**
     * Calculate settlements for current user.
     * Returns optimized list of who owes whom and how much.
     */
    @Transactional(readOnly = true)
    public List<SettlementResponse> calculateSettlements() {
        User currentUser = userService.getCurrentUser();
        List<Expense> expenses = expenseRepository.findAllExpensesInvolving(currentUser);

        return calculateOptimizedSettlements(expenses, currentUser);
    }

    /**
     * Calculate settlements between all users.
     */
    @Transactional(readOnly = true)
    public List<SettlementResponse> calculateAllSettlements() {
        List<Expense> expenses = expenseRepository.findAll();
        return calculateOptimizedSettlements(expenses, null);
    }

    /**
     * Calculate optimized settlements using debt simplification algorithm.
     *
     * Algorithm:
     * 1. Calculate net balance for each user (total paid - total owed)
     * 2. Separate users into creditors (positive balance) and debtors (negative balance)
     * 3. Match debtors with creditors to minimize number of transactions
     */
    private List<SettlementResponse> calculateOptimizedSettlements(List<Expense> expenses, User filterUser) {
        Map<Long, BigDecimal> netBalances = new HashMap<>();
        Map<Long, User> userMap = new HashMap<>();

        for (Expense expense : expenses) {
            User paidBy = expense.getPaidBy();
            userMap.put(paidBy.getId(), paidBy);

            netBalances.put(paidBy.getId(),
                    netBalances.getOrDefault(paidBy.getId(), BigDecimal.ZERO)
                            .add(expense.getAmount()));

            for (ExpenseShare share : expense.getShares()) {
                User shareUser = share.getUser();
                userMap.put(shareUser.getId(), shareUser);

                netBalances.put(shareUser.getId(),
                        netBalances.getOrDefault(shareUser.getId(), BigDecimal.ZERO)
                                .subtract(share.getShareAmount()));
            }
        }

        PriorityQueue<Balance> creditors = new PriorityQueue<>(
                (a, b) -> b.amount.compareTo(a.amount));
        PriorityQueue<Balance> debtors = new PriorityQueue<>(
                (a, b) -> a.amount.compareTo(b.amount));

        for (Map.Entry<Long, BigDecimal> entry : netBalances.entrySet()) {
            if (entry.getValue().compareTo(BigDecimal.ZERO) > 0) {
                creditors.offer(new Balance(entry.getKey(), entry.getValue()));
            } else if (entry.getValue().compareTo(BigDecimal.ZERO) < 0) {
                debtors.offer(new Balance(entry.getKey(), entry.getValue().abs()));
            }
        }

        List<SettlementResponse> settlements = new ArrayList<>();

        while (!creditors.isEmpty() && !debtors.isEmpty()) {
            Balance creditor = creditors.poll();
            Balance debtor = debtors.poll();

            BigDecimal settlementAmount = creditor.amount.min(debtor.amount);

            User creditorUser = userMap.get(creditor.userId);
            User debtorUser = userMap.get(debtor.userId);

            if (filterUser == null ||
                creditor.userId.equals(filterUser.getId()) ||
                debtor.userId.equals(filterUser.getId())) {

                settlements.add(SettlementResponse.builder()
                        .from(userService.mapToUserResponse(debtorUser))
                        .to(userService.mapToUserResponse(creditorUser))
                        .amount(settlementAmount)
                        .build());
            }

            BigDecimal remainingCreditor = creditor.amount.subtract(settlementAmount);
            BigDecimal remainingDebtor = debtor.amount.subtract(settlementAmount);

            if (remainingCreditor.compareTo(BigDecimal.ZERO) > 0) {
                creditors.offer(new Balance(creditor.userId, remainingCreditor));
            }
            if (remainingDebtor.compareTo(BigDecimal.ZERO) > 0) {
                debtors.offer(new Balance(debtor.userId, remainingDebtor));
            }
        }

        return settlements;
    }

    /**
     * Calculate settlement between current user and another user.
     */
    @Transactional(readOnly = true)
    public SettlementResponse calculateSettlementBetweenUsers(Long otherUserId) {
        User currentUser = userService.getCurrentUser();
        User otherUser = userService.getUserById(otherUserId);

        List<Expense> expenses = expenseRepository.findExpensesBetweenUsers(currentUser, otherUser);

        BigDecimal netBalance = BigDecimal.ZERO;

        for (Expense expense : expenses) {
            if (expense.getPaidBy().getId().equals(currentUser.getId())) {
                BigDecimal otherUserShare = expense.getShares().stream()
                        .filter(share -> share.getUser().getId().equals(otherUserId))
                        .map(ExpenseShare::getShareAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                netBalance = netBalance.add(otherUserShare);
            } else if (expense.getPaidBy().getId().equals(otherUserId)) {
                BigDecimal currentUserShare = expense.getShares().stream()
                        .filter(share -> share.getUser().getId().equals(currentUser.getId()))
                        .map(ExpenseShare::getShareAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                netBalance = netBalance.subtract(currentUserShare);
            }
        }

        if (netBalance.compareTo(BigDecimal.ZERO) > 0) {
            return SettlementResponse.builder()
                    .from(userService.mapToUserResponse(otherUser))
                    .to(userService.mapToUserResponse(currentUser))
                    .amount(netBalance)
                    .build();
        } else if (netBalance.compareTo(BigDecimal.ZERO) < 0) {
            return SettlementResponse.builder()
                    .from(userService.mapToUserResponse(currentUser))
                    .to(userService.mapToUserResponse(otherUser))
                    .amount(netBalance.abs())
                    .build();
        } else {
            return null;
        }
    }

    /**
     * Helper class to store user balance.
     */
    private static class Balance {
        Long userId;
        BigDecimal amount;

        Balance(Long userId, BigDecimal amount) {
            this.userId = userId;
            this.amount = amount;
        }
    }
}
