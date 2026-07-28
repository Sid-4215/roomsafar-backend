package com.roomsafar.booking_service.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.roomsafar.booking_service.dto.BookingRequest;
import com.roomsafar.booking_service.dto.BookingResponse;
import com.roomsafar.booking_service.service.BookingService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @RequestHeader("X-User-Email") String email,
            @RequestHeader("X-User-Role") String role,
            @RequestBody BookingRequest request) {

        Long userId = 1L; // Later fetch from user-service

        BookingResponse response = bookingService.createBooking(userId, request);

        return ResponseEntity.ok(response);
    }
}
