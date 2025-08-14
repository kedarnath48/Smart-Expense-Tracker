package com.example.vibecode.repository;

import com.example.vibecode.model.expenseclass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<expenseclass, Long> {
    
    // Find expenses by category
    List<expenseclass> findByCategory(String category);
    
    // Find expenses by date range
    List<expenseclass> findByDateBetween(LocalDate startDate, LocalDate endDate);
    
    // Find expenses by amount greater than
    List<expenseclass> findByAmountGreaterThan(double amount);
    
    // Find expenses by amount less than
    List<expenseclass> findByAmountLessThan(double amount);
    
    // Find expenses by category and date range
    List<expenseclass> findByCategoryAndDateBetween(String category, LocalDate startDate, LocalDate endDate);
    
    // Find expenses containing description text (case-insensitive)
    List<expenseclass> findByDescriptionContainingIgnoreCase(String description);
    
    // Custom query to get total amount by category
    @Query("SELECT SUM(e.amount) FROM expenseclass e WHERE e.category = :category")
    Double getTotalAmountByCategory(@Param("category") String category);
    
    // Custom query to get expenses for current month
    @Query("SELECT e FROM expenseclass e WHERE MONTH(e.date) = MONTH(CURRENT_DATE) AND YEAR(e.date) = YEAR(CURRENT_DATE)")
    List<expenseclass> findExpensesForCurrentMonth();
    
    // Find all expenses ordered by date descending
    List<expenseclass> findAllByOrderByDateDesc();
    
    // Find all expenses ordered by amount descending
    List<expenseclass> findAllByOrderByAmountDesc();
    
    // Get expenses by specific date
    List<expenseclass> findByDate(LocalDate date);
}
