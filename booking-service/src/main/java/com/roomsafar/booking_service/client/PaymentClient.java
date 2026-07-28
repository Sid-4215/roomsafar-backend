package com.roomsafar.booking_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.roomsafar.booking_service.dto.PaymentOrderResponse;
import com.roomsafar.booking_service.dto.PaymentRequest;

@FeignClient(name = "payment-service")
public interface PaymentClient {

    @PostMapping("/api/payments/create-order")
    PaymentOrderResponse createOrder(@RequestBody PaymentRequest request);
}
