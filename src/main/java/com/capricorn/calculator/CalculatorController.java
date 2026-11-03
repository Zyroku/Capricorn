package com.capricorn.calculator;

import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CalculatorController {
    @GetMapping("/")
    public ResponseEntity<Void> home() {
        return ResponseEntity.status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, "/index.html")
                .build();
    }

    @PostMapping("/api/calculate")
    public ResponseEntity<Map<String, Object>> calculateExpression(
            @RequestBody CalculationRequest request) {
        if (request == null || request.expression() == null || request.expression().isBlank()) {
            return error("Enter an expression to calculate.");
        }

        try {
            double result = new ArithmeticParser(request.expression()).parse();
            return ResponseEntity.ok(Map.of("result", result));
        } catch (IllegalArgumentException exception) {
            return error(exception.getMessage());
        }
    }

    @GetMapping("/calculate")
    public ResponseEntity<Map<String, Object>> calculatePair(
            @RequestParam double num1,
            @RequestParam double num2,
            @RequestParam String operator) {
        double result;
        switch (operator.toLowerCase()) {
            case "add", "+" -> result = num1 + num2;
            case "subtract", "-" -> result = num1 - num2;
            case "multiply", "*" -> result = num1 * num2;
            case "divide", "/" -> {
                if (num2 == 0) {
                    return error("Cannot divide by zero.");
                }
                result = num1 / num2;
            }
            default -> {
                return error("Operator must be add, subtract, multiply, or divide.");
            }
        }

        if (!Double.isFinite(result)) {
            return error("The result is outside the supported numeric range.");
        }
        return ResponseEntity.ok(Map.of("result", result));
    }

    private ResponseEntity<Map<String, Object>> error(String message) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", message));
    }

    public record CalculationRequest(String expression) {}
}
