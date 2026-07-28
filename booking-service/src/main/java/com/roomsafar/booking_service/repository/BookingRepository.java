package com.roomsafar.booking_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.roomsafar.booking_service.entity.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {

}
