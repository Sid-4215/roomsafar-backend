package com.roomsafar.booking_service.service;

import com.roomsafar.booking_service.dto.BookingRequest;
import com.roomsafar.booking_service.dto.BookingResponse;

public interface BookingService {

	BookingResponse createBooking(Long userId, BookingRequest request);

}
