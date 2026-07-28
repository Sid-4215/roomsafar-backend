package com.roomsafar.booking_service.dto;

import lombok.Data;

@Data
public class BookingRequest {
    private Long roomId;
    private Integer amount;
}
