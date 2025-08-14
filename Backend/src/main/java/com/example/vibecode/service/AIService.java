package com.example.vibecode.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.HashMap;

@Service
public class AIService {
    
    private final RestTemplate restTemplate;
    // You can use OpenAI, Gemini, or local AI models
    private static final String AI_API_URL = "https://api.openai.com/v1/chat/completions";
    private static final String API_KEY = "your-api-key-here"; // Use environment variable
    
    public AIService() {
        this.restTemplate = new RestTemplate();
        new ObjectMapper();
    }
    
    /**
     * Auto-categorize expense based on description using AI
     */
    public String categorizeExpense(String description) {
        try {
            String prompt = String.format(
                "Categorize this expense into one of these categories: " +
                "Food, Transportation, Entertainment, Bills, Shopping, Health, Education, Other. " +
                "Expense description: '%s'. " +
                "Return only the category name.", description
            );
            
            return callAI(prompt);
        } catch (Exception e) {
            // Fallback to rule-based categorization
            return fallbackCategorization(description);
        }
    }
    
    /**
     * Generate expense insights and recommendations
     */
    public String generateInsights(double totalSpent, String topCategory) {
        try {
            String prompt = String.format(
                "Generate a brief financial insight for someone who spent ₹%.2f total, " +
                "with '%s' being their top spending category. " +
                "Provide 1-2 sentences of helpful advice.", totalSpent, topCategory
            );
            
            return callAI(prompt);
        } catch (Exception e) {
            return "Keep tracking your expenses to build better financial habits!";
        }
    }
    
    /**
     * Predict future expenses based on historical data
     */
    public double predictNextMonthExpenses(double[] lastThreeMonths) {
        // Simple AI prediction - you can enhance with ML models
        double average = 0;
        for (double month : lastThreeMonths) {
            average += month;
        }
        average /= lastThreeMonths.length;
        
        // Add 5% growth prediction
        return average * 1.05;
    }
    
    private String callAI(String prompt) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(API_KEY);
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "gpt-3.5-turbo");
        requestBody.put("messages", new Object[]{
            Map.of("role", "user", "content", prompt)
        });
        requestBody.put("max_tokens", 50);
        requestBody.put("temperature", 0.3);
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        
        // Call AI API (implement proper error handling)
        Map<String, Object> response = restTemplate.postForObject(AI_API_URL, request, Map.class);
        
        // Extract response text (simplified)
        return extractResponseText(response);
    }
    
    private String extractResponseText(Map<String, Object> response) {
        // Parse AI response and extract the text
        // Implementation depends on AI service used
        return "AI Response"; // Placeholder
    }
    
    private String fallbackCategorization(String description) {
        String desc = description.toLowerCase();
        
        if (desc.contains("food") || desc.contains("restaurant") || desc.contains("lunch") || desc.contains("dinner")) {
            return "Food";
        } else if (desc.contains("bus") || desc.contains("taxi") || desc.contains("fuel") || desc.contains("transport")) {
            return "Transportation";
        } else if (desc.contains("movie") || desc.contains("game") || desc.contains("entertainment")) {
            return "Entertainment";
        } else if (desc.contains("electricity") || desc.contains("water") || desc.contains("internet") || desc.contains("phone")) {
            return "Bills";
        } else if (desc.contains("shopping") || desc.contains("clothes") || desc.contains("amazon")) {
            return "Shopping";
        } else if (desc.contains("doctor") || desc.contains("medicine") || desc.contains("hospital")) {
            return "Health";
        } else {
            return "Other";
        }
    }
}
