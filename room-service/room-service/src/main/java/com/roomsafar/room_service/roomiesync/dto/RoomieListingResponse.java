package com.roomsafar.room_service.roomiesync.dto;

import com.roomsafar.room_service.roomiesync.enums.RoomieListingType;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RoomieListingResponse {
    private Long id;
    private Long ownerId;
    private RoomieListingType listingType;
    private String title;
    private String description;
    private String area;
    private String city;
    private String pincode;
    private Integer totalRent;
    private Integer rentShare;
    private Integer deposit;
    private Integer totalRoommates;
    private Integer spotsAvailable;
    private String roomType;
    private Boolean furnished;
    private String genderPreference;
    private String occupationPreference;
    private List<String> amenities;
    private List<String> photos;
    private String contactName;
    private String contactPhone;
    private LocalDate availableFrom;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
