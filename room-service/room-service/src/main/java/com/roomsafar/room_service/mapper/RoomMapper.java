package com.roomsafar.room_service.mapper;

import org.mapstruct.*;
import com.roomsafar.room_service.dto.*;
import com.roomsafar.room_service.entity.Room;
import com.roomsafar.room_service.entity.RoomImage;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RoomMapper {

    // ⭐ Map Room to RoomResponse
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "amenities", ignore = true)
    RoomResponse toResponse(Room room);

    // ⭐ Map list of Room to list of RoomResponse
    List<RoomResponse> toResponseList(List<Room> rooms);

    // ⭐ After mapping - populate images and amenities
    @AfterMapping
    default void fillImagesAndAmenities(Room room, @MappingTarget RoomResponse response) {
        // Map images
        if (room.getImages() != null) {
            List<RoomImageResponse> imageResponses = room.getImages().stream()
                    .map(this::toImageResponse)
                    .toList();
            response.setImages(imageResponses);
        }
        
        // Set amenities
        response.setAmenities(room.getAmenities());
    }

    // ⭐ FIX: Map RoomImage to RoomImageResponse with proper field mapping
    @Mapping(source = "imageUrl", target = "url")  // ⭐ IMPORTANT: Map imageUrl to url
    RoomImageResponse toImageResponse(RoomImage roomImage);
    
    // ⭐ Map RoomImageRequest to RoomImage entity
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "room", ignore = true)
    @Mapping(source = "url", target = "imageUrl")  // ⭐ Map url to imageUrl
    RoomImage toImageEntity(RoomImageRequest request);
}