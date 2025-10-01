package com.brotherhood.approval.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("")
public class SimpleController {
    
    @GetMapping("/")
    public Map<String, Object> root() {
        Map<String, Object> response = new HashMap<>();
        response.put("service", "Brotherhood Approval System API");
        response.put("version", "1.0.0");
        response.put("status", "Running");
        response.put("endpoints", Map.of(
            "health", "/health",
            "hello", "/hello",
            "login", "/api/auth/login",
            "users", "/api/users",
            "documents", "/api/documents",
            "swagger", "/swagger-ui.html"
        ));
        return response;
    }
    
    @GetMapping("/hello")
    public String hello() {
        return "Hello World!";
    }
}
