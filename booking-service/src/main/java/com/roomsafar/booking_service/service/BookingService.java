package com.roomsafar.booking_service.service;

import java.util.List;

import com.roomsafar.booking_service.dto.BookingRequest;
import com.roomsafar.booking_service.dto.BookingResponse;

public interface BookingService {

    BookingResponse createBooking(Long userId, String userEmail, BookingRequest request);

    List<BookingResponse> getMyBookings(String userEmail);
}
