package com.example.vibecode.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HelloController {

    @GetMapping("/hello")
    public String hello() {
        return "Hello, Vibecode! Welcome to Spring Boot!";
    }

    @GetMapping("/")
    public String home() {
        return "Vibecode Spring Boot Application is running successfully!";
    }
}
