package com.roomsafar.room_service.dto;

import com.roomsafar.room_service.enums.Furnished;
import com.roomsafar.room_service.enums.Gender;
import com.roomsafar.room_service.enums.RoomType;
import com.roomsafar.room_service.entity.Address;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;

@Data
public class RoomRequest {

    // Pricing
    @NotNull(message = "Rent is required")
    @Min(value = 1000, message = "Rent must be at least ₹1000")
    private Integer rent;

    @NotNull(message = "Deposit is required")
    @Min(value = 0, message = "Deposit cannot be negative")
    private Integer deposit;

    // Address
    @NotNull(message = "Address is required")
    private Address address;

    // Room details
    @NotNull(message = "Room type is required")
    private RoomType type;

    @NotNull(message = "Furnishing status is required")
    private Furnished furnished;

    @NotNull(message = "Gender preference is required")
    private Gender gender;

    // Enhanced Contact Information
    @NotBlank(message = "At least one contact method is required")
    @Size(min = 10, max = 10, message = "WhatsApp number must be 10 digits")
    private String whatsapp;

    @Size(min = 10, max = 10, message = "Phone number must be 10 digits")
    private String phone;

    @Size(max = 100, message = "Instagram username too long")
    private String instagram;

    @Size(max = 100, message = "Telegram username too long")
    private String telegram;

    @NotNull(message = "Contact preference is required")
    private String contactPreference = "WHATSAPP";

    // Brokerage Information
    @NotNull(message = "Brokerage status is required")
    private Boolean brokerageRequired = false;

    @Min(value = 0, message = "Brokerage amount cannot be negative")
    private Integer brokerageAmount;

    // Description
    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    private String description;

    // Enhanced Images with labels
    @NotNull(message = "At least one image is required")
    @Size(min = 1, max = 20, message = "You must provide 1-20 images")
    private List<RoomImageRequest> images;

    // Amenities
    private List<String> amenities;
}