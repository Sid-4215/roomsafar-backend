package com.roomsafar.payment_service.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentRequest {
    
    @NotNull(message = "Amount is required")
    @Min(value = 1, message = "Amount must be at least 1 paise")
    private Integer amount; // in paise
    
    private String currency = "INR";
    private String receipt;
}