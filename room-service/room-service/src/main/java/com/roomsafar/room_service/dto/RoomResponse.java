package com.roomsafar.room_service.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.roomsafar.room_service.entity.Address;
import com.roomsafar.room_service.enums.Furnished;
import com.roomsafar.room_service.enums.Gender;
import com.roomsafar.room_service.enums.RoomType;

import lombok.Data;

@Data
public class RoomResponse {
    private Long id;
    private Integer rent;
    private Integer deposit;
    private RoomType type;
    private Furnished furnished;
    private Gender gender;

    private String whatsapp;
    private String phone;
    private String instagram;
    private String telegram;
    private String contactPreference;

    private Boolean brokerageRequired;
    private Integer brokerageAmount;

    private String description;

    // ⭐ ADD THIS ⭐
    private Address address;

    private String line1;
    private String area;
    private String city;
    private String state;
    private String pincode;

    private Double latitude;
    private Double longitude;

    private Long ownerId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private List<String> amenities;
    private List<RoomImageResponse> images;
}
