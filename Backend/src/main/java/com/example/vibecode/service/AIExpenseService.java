package com.example.vibecode.service;

import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

/**
 * AI-powered expense categorization service
 * Uses pattern matching and keyword analysis to suggest expense categories
 */
@Service
public class AIExpenseService {
    
    private final Map<String, String[]> categoryKeywords = new HashMap<>();
    
    public AIExpenseService() {
        initializeCategoryKeywords();
    }
    
    /**
     * Predict expense category based on description
     * @param description The expense description
     * @return Predicted category
     */
    public String predictCategory(String description) {
        if (description == null || description.trim().isEmpty()) {
            return "Other";
        }
        
        String lowerDesc = description.toLowerCase();
        
        // Check each category's keywords
        for (Map.Entry<String, String[]> entry : categoryKeywords.entrySet()) {
            String category = entry.getKey();
            String[] keywords = entry.getValue();
            
            for (String keyword : keywords) {
                if (lowerDesc.contains(keyword.toLowerCase())) {
                    return category;
                }
            }
        }
        
        return "Other"; // Default category
    }
    
    /**
     * Get confidence score for prediction (0-100)
     */
    public int getPredictionConfidence(String description, String predictedCategory) {
        if (description == null || description.trim().isEmpty()) {
            return 0;
        }
        
        String lowerDesc = description.toLowerCase();
        String[] keywords = categoryKeywords.get(predictedCategory);
        
        if (keywords == null) return 0;
        
        int matches = 0;
        for (String keyword : keywords) {
            if (lowerDesc.contains(keyword.toLowerCase())) {
                matches++;
            }
        }
        
        // Calculate confidence based on keyword matches
        return Math.min(100, (matches * 30) + 40);
    }
    
    /**
     * Suggest amount based on similar expenses
     */
    public Double suggestAmount(String description, String category) {
        // This would typically query historical data
        // For demo, returning category-based averages
        Map<String, Double> averageAmounts = Map.of(
            "Food", 250.0,
            "Transportation", 150.0,
            "Entertainment", 400.0,
            "Bills", 1200.0,
            "Shopping", 800.0,
            "Healthcare", 600.0,
            "Education", 1500.0,
            "Hotel", 2500.0
        );
        
        return averageAmounts.getOrDefault(category, 100.0);
    }
    
    /**
     * Analyze spending patterns and provide insights
     */
    public String generateSpendingInsight(Map<String, Double> categoryTotals, double totalSpent) {
        if (categoryTotals.isEmpty()) {
            return "Start tracking expenses to get AI insights!";
        }
        
        // Find highest spending category
        String topCategory = categoryTotals.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse("Unknown");
        
        double topCategoryAmount = categoryTotals.get(topCategory);
        double percentage = (topCategoryAmount / totalSpent) * 100;
        
        StringBuilder insight = new StringBuilder();
        insight.append(String.format("💡 AI Insight: Your highest spending is on %s (%.1f%% of total). ", 
                                    topCategory, percentage));
        
        // Add recommendations based on spending patterns
        if (percentage > 40) {
            insight.append(String.format("Consider setting a budget for %s to control spending.", topCategory));
        } else if (categoryTotals.size() < 3) {
            insight.append("Try categorizing expenses more specifically for better insights.");
        } else {
            insight.append("Your spending is well-distributed across categories. Good job! 👍");
        }
        
        return insight.toString();
    }
    
    /**
     * Initialize keyword mappings for categories
     */
    private void initializeCategoryKeywords() {
        categoryKeywords.put("Food", new String[]{
            "restaurant", "food", "lunch", "dinner", "breakfast", "cafe", "coffee", 
            "starbucks", "mcdonald", "pizza", "burger", "grocery", "supermarket",
            "swiggy", "zomato", "dominos", "kfc", "subway"
        });
        
        categoryKeywords.put("Transportation", new String[]{
            "uber", "ola", "taxi", "bus", "metro", "train", "flight", "petrol", 
            "diesel", "fuel", "parking", "toll", "auto", "rickshaw", "cab"
        });
        
        categoryKeywords.put("Entertainment", new String[]{
            "movie", "cinema", "netflix", "spotify", "game", "concert", "theatre",
            "bowling", "party", "club", "bar", "entertainment", "fun", "hobby"
        });
        
        categoryKeywords.put("Bills", new String[]{
            "electricity", "water", "gas", "internet", "mobile", "phone", "wifi",
            "maintenance", "rent", "emi", "loan", "insurance", "bill", "utility"
        });
        
        categoryKeywords.put("Shopping", new String[]{
            "amazon", "flipkart", "shopping", "clothes", "shirt", "shoes", "bag",
            "electronics", "mobile", "laptop", "gift", "myntra", "ajio"
        });
        
        categoryKeywords.put("Healthcare", new String[]{
            "doctor", "hospital", "medicine", "pharmacy", "medical", "health",
            "clinic", "dentist", "checkup", "apollo", "max", "fortis"
        });
        
        categoryKeywords.put("Education", new String[]{
            "course", "education", "training", "certification", "udemy",
            "coursera", "school", "college", "tuition", "workshop", "seminar"
        });
        
        categoryKeywords.put("Hotel", new String[]{
            "hotel", "accommodation", "stay", "resort", "lodge", "inn",
            "guesthouse", "airbnb", "oyo", "treebo", "fab hotels", "marriott",
            "taj", "hyatt", "hilton", "radisson", "room booking", "check-in",
            "booking.com", "makemytrip", "goibibo"
        });
    }
}
