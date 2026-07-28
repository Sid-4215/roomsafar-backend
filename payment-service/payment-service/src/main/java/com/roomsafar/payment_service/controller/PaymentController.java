package com.roomsafar.payment_service.controller;

import java.util.UUID;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.roomsafar.payment_service.dto.PaymentRequest;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Value("${razorpay.key:}")
    private String key;

    @Value("${razorpay.secret:}")
    private String secret;

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@Valid @RequestBody PaymentRequest paymentRequest) {
        try {
            if (key == null || key.isEmpty() || secret == null || secret.isEmpty()) {
                log.error("Razorpay credentials not configured");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"Razorpay credentials not configured\"}");
            }
            
            RazorpayClient client = new RazorpayClient(key, secret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", paymentRequest.getAmount());
            orderRequest.put("currency", paymentRequest.getCurrency() != null ? 
                paymentRequest.getCurrency() : "INR");
            orderRequest.put("receipt", paymentRequest.getReceipt() != null ? 
                paymentRequest.getReceipt() : "roomsafar_" + UUID.randomUUID());

            Order order = client.orders.create(orderRequest);
            
            log.info("Order created successfully with ID: " + order.get("id"));

            // Create response JSON
            JSONObject response = new JSONObject();
            response.put("orderId", String.valueOf(order.get("id")));
            response.put("amount", String.valueOf(order.get("amount")));
            response.put("currency", String.valueOf(order.get("currency")));
            response.put("status", String.valueOf(order.get("status")));
            response.put("receipt", String.valueOf(order.get("receipt")));

            return ResponseEntity.ok(response.toString());
            
        } catch (RazorpayException e) {
            log.error("Razorpay error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("{\"error\": \"Payment gateway error: " + e.getMessage() + "\"}");
        } catch (Exception e) {
            log.error("Unexpected error: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("{\"error\": \"Internal server error\"}");
        }
    }
}