package com.roomsafar.api_gateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @GetMapping("/room-service")
    public ResponseEntity<?> roomFallback() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("message", "Room Service unavailable", "status", "SERVICE_UNAVAILABLE"));
    }

    @GetMapping("/payment-service")
    public ResponseEntity<?> paymentFallback() {
        return ResponseEntity.status(503)
                .body(Map.of("message", "Payment Service unavailable", "status", "SERVICE_UNAVAILABLE"));
    }

    @GetMapping("/booking-service")
    public ResponseEntity<?> bookingFallback() {
        return ResponseEntity.status(503)
                .body(Map.of("message", "Booking Service unavailable", "status", "SERVICE_UNAVAILABLE"));
    }

    @GetMapping("/user-service")
    public ResponseEntity<?> userFallback() {
        return ResponseEntity.status(503)
                .body(Map.of("message", "User Service unavailable", "status", "SERVICE_UNAVAILABLE"));
    }
}
