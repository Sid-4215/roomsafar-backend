package com.roomsafar.booking_service.dto;

import com.roomsafar.booking_service.enums.BookingStatus;

import lombok.Data;

@Data
public class BookingResponse {
    private Long bookingId;
    private BookingStatus status;
    private String paymentOrderId;
}

