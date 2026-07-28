package com.roomsafar.room_service.service;

import java.util.List;

import org.springframework.data.domain.Page;

import com.roomsafar.room_service.dto.RoomRequest;
import com.roomsafar.room_service.dto.RoomResponse;

public interface RoomService {

    RoomResponse createRoom(RoomRequest request, Long ownerId);

    Page<RoomResponse> getAllRooms(int page, int size, String sortBy, String sortDir);

    RoomResponse getRoomById(Long id);

    Page<RoomResponse> search(
            String area,
            String city,
            String type,
            String furnished,
            String gender,
            Integer minRent,
            Integer maxRent,
            String createdOn,
            String startDate,
            String endDate,
            int page,
            int size,
            String sortBy,
            String sortDir
    );


    RoomResponse updateRoom(Long id, RoomRequest request, Long ownerId);

    void deleteRoom(Long id, Long ownerId);

    Page<RoomResponse> getRoomsByOwner(Long ownerId, int page, int size);
    
    public List<Long> getAllRoomIds();
}
