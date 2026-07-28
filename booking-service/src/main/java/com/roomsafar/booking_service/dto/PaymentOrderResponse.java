package com.roomsafar.booking_service.dto;

import lombok.Data;

@Data
public class PaymentOrderResponse {
    private String orderId;
    private String amount;
    private String currency;
    private String status;
    private String receipt;
}
