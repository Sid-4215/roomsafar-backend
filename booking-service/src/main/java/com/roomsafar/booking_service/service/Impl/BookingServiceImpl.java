package com.roomsafar.booking_service.service.Impl;

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

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final PaymentClient paymentClient;

    @Override
    @Transactional
    public BookingResponse createBooking(Long userId, BookingRequest request) {

        // Save initial booking
        Booking booking = new Booking();
        booking.setRoomId(request.getRoomId());
        booking.setUserId(userId);
        booking.setAmount(request.getAmount());
        booking.setStatus(BookingStatus.PAYMENT_PENDING);

        Booking savedBooking = bookingRepository.save(booking);

        // Send payment request via Feign
        PaymentRequest paymentRequest = new PaymentRequest(
                savedBooking.getAmount(),
                "INR",
                "booking_" + savedBooking.getId()
        );

        PaymentOrderResponse paymentResponse = paymentClient.createOrder(paymentRequest);

        savedBooking.setPaymentOrderId(paymentResponse.getOrderId());
        savedBooking.setStatus(BookingStatus.PAYMENT_PENDING);

        bookingRepository.save(savedBooking);

        // Build response
        BookingResponse response = new BookingResponse();
        response.setBookingId(savedBooking.getId());
        response.setStatus(savedBooking.getStatus());
        response.setPaymentOrderId(savedBooking.getPaymentOrderId());

        return response;
    }
}
