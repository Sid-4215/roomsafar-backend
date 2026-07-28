package com.roomsafar.room_service.roomiesync.dto;

import com.roomsafar.room_service.roomiesync.enums.RoomieListingType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;
import lombok.Data;

@Data
public class RoomieListingRequest {

    @NotNull(message = "Listing type is required")
    private RoomieListingType listingType;

    @NotBlank(message = "Title is required")
    @Size(max = 180, message = "Title cannot exceed 180 characters")
    private String title;

    @Size(max = 2500, message = "Description cannot exceed 2500 characters")
    private String description;

    @NotBlank(message = "Area is required")
    private String area;

    @NotBlank(message = "City is required")
    private String city;

    private String pincode;

    @Min(value = 0, message = "Total rent cannot be negative")
    private Integer totalRent;

    @NotNull(message = "Rent share or budget is required")
    @Min(value = 0, message = "Rent share cannot be negative")
    private Integer rentShare;

    @Min(value = 0, message = "Deposit cannot be negative")
    private Integer deposit;

    private Integer totalRoommates;

    private Integer spotsAvailable;

    @NotBlank(message = "Room type is required")
    private String roomType;

    @NotNull(message = "Furnished flag is required")
    private Boolean furnished;

    @NotBlank(message = "Gender preference is required")
    private String genderPreference;

    @NotBlank(message = "Occupation preference is required")
    private String occupationPreference;

    private List<String> amenities;

    @Size(max = 10, message = "A listing can store up to 10 base64 photos")
    private List<String> photos;

    @NotBlank(message = "Contact name is required")
    private String contactName;

    @NotBlank(message = "Contact phone is required")
    private String contactPhone;

    private LocalDate availableFrom;
}
