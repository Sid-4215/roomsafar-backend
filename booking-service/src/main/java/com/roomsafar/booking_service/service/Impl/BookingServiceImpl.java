package com.roomsafar.booking_service.service.Impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.roomsafar.booking_service.client.PaymentClient;
import com.roomsafar.booking_service.dto.BookingRequest;
import com.roomsafar.booking_service.dto.BookingResponse;
import com.roomsafar.booking_service.dto.PaymentOrderResponse;
import com.roomsafar.booking_service.dto.PaymentRequest;
import com.roomsafar.booking_service.entity.Booking;
import com.roomsafar.booking_service.enums.BookingStatus;
import com.roomsafar.booking_service.repository.BookingRepository;
import com.roomsafar.booking_service.service.BookingService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final PaymentClient paymentClient;

    @Override
    @Transactional
    public BookingResponse createBooking(Long userId, String userEmail, BookingRequest request) {

        Booking booking = new Booking();
        booking.setRoomId(request.getRoomId());
        booking.setUserId(userId);
        booking.setAmount(request.getAmount());
        booking.setStatus(BookingStatus.PAYMENT_PENDING);
        booking.setStartDate(request.getStartDate());
        booking.setEndDate(request.getEndDate());
        booking.setUserEmail(userEmail);

        Booking savedBooking = bookingRepository.save(booking);

        // Attempt payment order creation; fall back gracefully if payment service unavailable
        try {
            PaymentRequest paymentRequest = new PaymentRequest(
                    savedBooking.getAmount(),
                    "INR",
                    "booking_" + savedBooking.getId()
            );
            PaymentOrderResponse paymentResponse = paymentClient.createOrder(paymentRequest);
            savedBooking.setPaymentOrderId(paymentResponse.getOrderId());
            bookingRepository.save(savedBooking);
        } catch (Exception e) {
            log.warn("Payment service unavailable, booking saved without payment order: {}", e.getMessage());
        }

        return toResponse(savedBooking);
    }

    @Override
    public List<BookingResponse> getMyBookings(String userEmail) {
        // Find bookings by userEmail (stored on create)
        return bookingRepository.findAll().stream()
                .filter(b -> userEmail.equals(b.getUserEmail()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private BookingResponse toResponse(Booking b) {
        BookingResponse r = new BookingResponse();
        r.setBookingId(b.getId());
        r.setRoomId(b.getRoomId());
        r.setAmount(b.getAmount());
        r.setStatus(b.getStatus());
        r.setPaymentOrderId(b.getPaymentOrderId());
        r.setStartDate(b.getStartDate());
        r.setEndDate(b.getEndDate());
        r.setUserEmail(b.getUserEmail());
        r.setCreatedAt(b.getCreatedAt());
        return r;
    }
}
