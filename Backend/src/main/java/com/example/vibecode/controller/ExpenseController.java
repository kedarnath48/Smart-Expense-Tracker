package com.example.vibecode.controller;

import com.example.vibecode.model.expenseclass;
import com.example.vibecode.service.ExpenseService;
import com.example.vibecode.service.AIExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private AIExpenseService aiExpenseService;

    // GET - Get all expenses
    @GetMapping
    public ResponseEntity<List<expenseclass>> getAllExpenses() {
        List<expenseclass> expenses = expenseService.getAllExpenses();
        return ResponseEntity.ok(expenses);
    }

    // GET - Get expense by ID
    @GetMapping("/{id}")
    public ResponseEntity<expenseclass> getExpenseById(@PathVariable Long id) {
        Optional<expenseclass> expense = expenseService.getExpenseById(id);
        if (expense.isPresent()) {
            return ResponseEntity.ok(expense.get());
        }
        return ResponseEntity.notFound().build();
    }

    // POST - Create new expense
    @PostMapping
    public ResponseEntity<expenseclass> createExpense(@RequestBody expenseclass expense) {
        expenseclass savedExpense = expenseService.saveExpense(expense);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedExpense);
    }

    // PUT - Update existing expense
    @PutMapping("/{id}")
    public ResponseEntity<expenseclass> updateExpense(@PathVariable Long id, @RequestBody expenseclass expense) {
        expenseclass updatedExpense = expenseService.updateExpense(id, expense);
        if (updatedExpense != null) {
            return ResponseEntity.ok(updatedExpense);
        }
        return ResponseEntity.notFound().build();
    }

    // DELETE - Delete expense
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        if (expenseService.existsById(id)) {
            expenseService.deleteExpense(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // GET - Get expenses by category
    @GetMapping("/category/{category}")
    public ResponseEntity<List<expenseclass>> getExpensesByCategory(@PathVariable String category) {
        List<expenseclass> expenses = expenseService.getExpensesByCategory(category);
        return ResponseEntity.ok(expenses);
    }

    // GET - Get total expenses
    @GetMapping("/total")
    public ResponseEntity<Double> getTotalExpenses() {
        double total = expenseService.getTotalExpenses();
        return ResponseEntity.ok(total);
    }

    // GET - Get expense count
    @GetMapping("/count")
    public ResponseEntity<Long> getExpenseCount() {
        long count = expenseService.getExpenseCount();
        return ResponseEntity.ok(count);
    }

    // ============================= AI FEATURES =============================
    
    // POST - AI: Predict category for description
    @PostMapping("/ai/predict-category")
    public ResponseEntity<Map<String, Object>> predictCategory(@RequestBody Map<String, String> request) {
        String description = request.get("description");
        if (description == null || description.trim().isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Description is required");
            return ResponseEntity.badRequest().body(errorResponse);
        }
        
        String predictedCategory = aiExpenseService.predictCategory(description);
        int confidence = aiExpenseService.getPredictionConfidence(description, predictedCategory);
        Double suggestedAmount = aiExpenseService.suggestAmount(description, predictedCategory);
        
        Map<String, Object> response = new HashMap<>();
        response.put("predictedCategory", predictedCategory);
        response.put("confidence", confidence);
        response.put("suggestedAmount", suggestedAmount);
        response.put("description", description);
        
        return ResponseEntity.ok(response);
    }
    
    // POST - AI: Suggest amount for category
    @PostMapping("/ai/suggest-amount")
    public ResponseEntity<Map<String, Object>> suggestAmount(@RequestBody Map<String, String> request) {
        String category = request.get("category");
        if (category == null || category.trim().isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Category is required");
            return ResponseEntity.badRequest().body(errorResponse);
        }
        
        Double suggestedAmount = aiExpenseService.suggestAmount("", category);
        
        Map<String, Object> response = new HashMap<>();
        response.put("suggestedAmount", suggestedAmount);
        response.put("category", category);
        
        return ResponseEntity.ok(response);
    }
    
    // GET - AI: Get spending insights
    @GetMapping("/ai/insights")
    public ResponseEntity<Map<String, Object>> getSpendingInsights() {
        List<expenseclass> expenses = expenseService.getAllExpenses();
        
        // Calculate category totals
        Map<String, Double> categoryTotals = new HashMap<>();
        double totalSpent = 0.0;
        
        for (expenseclass expense : expenses) {
            String category = expense.getCategory();
            double amount = expense.getAmount();
            categoryTotals.put(category, categoryTotals.getOrDefault(category, 0.0) + amount);
            totalSpent += amount;
        }
        
        String insight = aiExpenseService.generateSpendingInsight(categoryTotals, totalSpent);
        
        Map<String, Object> response = new HashMap<>();
        response.put("insight", insight);
        response.put("categoryTotals", categoryTotals);
        response.put("totalSpent", totalSpent);
        response.put("expenseCount", expenses.size());
        
        return ResponseEntity.ok(response);
    }
}
