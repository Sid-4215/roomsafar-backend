package com.roomsafar.booking_service.dto;

import java.time.LocalDateTime;

import com.roomsafar.booking_service.enums.BookingStatus;

import lombok.Data;

@Data
public class BookingResponse {
    private Long bookingId;
    private Long roomId;
    private Integer amount;
    private BookingStatus status;
    private String paymentOrderId;
    private String startDate;
    private String endDate;
    private String userEmail;
    private LocalDateTime createdAt;
}

