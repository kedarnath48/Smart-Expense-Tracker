package com.example.vibecode.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "expenses")
public class expenseclass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String category;
    
    @Column(nullable = false)
    private double amount;
    
    private String description;
    
    @Column(nullable = false)
    private LocalDate date;

    // Constructors
    public expenseclass() {}

    public expenseclass(String category, double amount, String description, LocalDate date) {
        this.category = category;
        this.amount = amount;
        this.description = description;
        this.date = date;
    }

    // Getters and Setters
    public Long getId() { 
        return id; 
    }

    public void setId(Long id) {
        this.id = id; 
    }

    public String getCategory() {
        return category; 
    }

    public void setCategory(String category) {
        this.category = category; 
    }

    public double getAmount() {
        return amount; 
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getDescription() {
        return description; 
    }

    public void setDescription(String description) {
        this.description = description; 
    }

    public LocalDate getDate() {
        return date; 
    }
    
    public void setDate(LocalDate date) {
        this.date = date; 
    }

    @Override
    public String toString() {
        return "Expense{" +
                "id=" + id +
                ", category='" + category + '\'' +
                ", amount=" + amount +
                ", description='" + description + '\'' +
                ", date=" + date +
                '}';
    }
}
