package com.example.vibecode.service;

import com.example.vibecode.model.expenseclass;
import com.example.vibecode.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    // Create or update an expense
    public expenseclass saveExpense(expenseclass expense) {
        return expenseRepository.save(expense);
    }

    // Get all expenses
    public List<expenseclass> getAllExpenses() {
        return expenseRepository.findAll();
    }

    // Get expense by ID
    public Optional<expenseclass> getExpenseById(Long id) {
        return expenseRepository.findById(id);
    }

    // Delete expense by ID
    public void deleteExpense(Long id) {
        expenseRepository.deleteById(id);
    }

    // Get expenses by category
    public List<expenseclass> getExpensesByCategory(String category) {
        return expenseRepository.findByCategory(category);
    }

    // Get expenses by date range
    public List<expenseclass> getExpensesByDateRange(LocalDate startDate, LocalDate endDate) {
        return expenseRepository.findByDateBetween(startDate, endDate);
    }

    // Get expenses by amount greater than
    public List<expenseclass> getExpensesGreaterThan(double amount) {
        return expenseRepository.findByAmountGreaterThan(amount);
    }

    // Get expenses by amount less than
    public List<expenseclass> getExpensesLessThan(double amount) {
        return expenseRepository.findByAmountLessThan(amount);
    }

    // Get expenses by category and date range
    public List<expenseclass> getExpensesByCategoryAndDateRange(String category, LocalDate startDate, LocalDate endDate) {
        return expenseRepository.findByCategoryAndDateBetween(category, startDate, endDate);
    }

    // Search expenses by description
    public List<expenseclass> searchExpensesByDescription(String keyword) {
        return expenseRepository.findByDescriptionContainingIgnoreCase(keyword);
    }

    // Get total amount by category
    public Double getTotalAmountByCategory(String category) {
        Double total = expenseRepository.getTotalAmountByCategory(category);
        return total != null ? total : 0.0;
    }

    // Get current month expenses
    public List<expenseclass> getCurrentMonthExpenses() {
        return expenseRepository.findExpensesForCurrentMonth();
    }

    // Get all expenses ordered by date (newest first)
    public List<expenseclass> getExpensesOrderedByDate() {
        return expenseRepository.findAllByOrderByDateDesc();
    }

    // Get all expenses ordered by amount (highest first)
    public List<expenseclass> getExpensesOrderedByAmount() {
        return expenseRepository.findAllByOrderByAmountDesc();
    }

    // Get expenses by specific date
    public List<expenseclass> getExpensesByDate(LocalDate date) {
        return expenseRepository.findByDate(date);
    }

    // Calculate total expenses for all categories
    public double getTotalExpenses() {
        List<expenseclass> allExpenses = expenseRepository.findAll();
        return allExpenses.stream()
                .mapToDouble(expenseclass::getAmount)
                .sum();
    }

    // Calculate total expenses for current month
    public double getCurrentMonthTotalExpenses() {
        List<expenseclass> currentMonthExpenses = getCurrentMonthExpenses();
        return currentMonthExpenses.stream()
                .mapToDouble(expenseclass::getAmount)
                .sum();
    }

    // Get expense count
    public long getExpenseCount() {
        return expenseRepository.count();
    }

    // Check if expense exists
    public boolean existsById(Long id) {
        return expenseRepository.existsById(id);
    }

    // Update an existing expense
    public expenseclass updateExpense(Long id, expenseclass updatedExpense) {
        Optional<expenseclass> existingExpense = expenseRepository.findById(id);
        if (existingExpense.isPresent()) {
            expenseclass expense = existingExpense.get();
            expense.setCategory(updatedExpense.getCategory());
            expense.setAmount(updatedExpense.getAmount());
            expense.setDescription(updatedExpense.getDescription());
            expense.setDate(updatedExpense.getDate());
            return expenseRepository.save(expense);
        }
        return null;
    }

    // Get expenses within amount range
    public List<expenseclass> getExpensesInAmountRange(double minAmount, double maxAmount) {
        return expenseRepository.findAll().stream()
                .filter(expense -> expense.getAmount() >= minAmount && expense.getAmount() <= maxAmount)
                .toList();
    }
}
