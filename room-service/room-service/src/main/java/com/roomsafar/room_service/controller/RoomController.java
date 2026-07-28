package com.roomsafar.room_service.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.roomsafar.room_service.dto.RoomRequest;
import com.roomsafar.room_service.dto.RoomResponse;
import com.roomsafar.room_service.service.RoomService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@Tag(name = "Room Management", description = "APIs for managing room listings")
public class RoomController {

    private final RoomService roomService;

    // ---------------------- CREATE ----------------------
    @Operation(summary = "Create a new room listing")
    @PostMapping
    public ResponseEntity<RoomResponse> createRoom(
            @RequestHeader("X-User-Id") Long ownerId,
            @Valid @RequestBody RoomRequest request) {

        RoomResponse response = roomService.createRoom(request, ownerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ---------------------- GET ALL ----------------------
    @Operation(summary = "Get all rooms with pagination")
    @GetMapping
    public ResponseEntity<Page<RoomResponse>> getAllRooms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Page<RoomResponse> rooms = roomService.getAllRooms(page, size, sortBy, sortDir);
        return ResponseEntity.ok(rooms);
    }

    // ---------------------- GET BY ID ----------------------
    @Operation(summary = "Get room by ID")
    @GetMapping("/{id}")
    public ResponseEntity<RoomResponse> getRoomById(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    // ---------------------- SEARCH ROOMS ----------------------
    @GetMapping("/search")
    public ResponseEntity<Page<RoomResponse>> searchRooms(
            @RequestParam(required = false) String area,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String furnished,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) Integer minRent,
            @RequestParam(required = false) Integer maxRent,
            @RequestParam(required = false) String createdOn,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        return ResponseEntity.ok(
                roomService.search(
                        area, city, type, furnished, gender,
                        minRent, maxRent,
                        createdOn, startDate, endDate,
                        page, size, sortBy, sortDir
                )
        );
    }


    // ---------------------- FEATURED ----------------------
    @Operation(summary = "Get featured rooms for homepage")
    @GetMapping("/featured")
    public ResponseEntity<List<RoomResponse>> getFeaturedRooms() {
        Page<RoomResponse> featuredPage = roomService.getAllRooms(0, 6, "createdAt", "desc");
        return ResponseEntity.ok(featuredPage.getContent());
    }

    // ---------------------- POPULAR AREAS ----------------------
    @Operation(summary = "Get popular areas with room counts")
    @GetMapping("/popular-areas")
    public ResponseEntity<Map<String, Long>> getPopularAreas() {
        Map<String, Long> popularAreas = new HashMap<>();
        popularAreas.put("Hinjewadi", 156L);
        popularAreas.put("Kharadi", 89L);
        popularAreas.put("Baner", 134L);
        popularAreas.put("Wakad", 76L);
        popularAreas.put("Viman Nagar", 98L);
        popularAreas.put("Kothrud", 67L);

        return ResponseEntity.ok(popularAreas);
    }

    // ---------------------- UPDATE ----------------------
    @Operation(summary = "Update a room listing (owner only)")
    @PutMapping("/{id}")
    public ResponseEntity<RoomResponse> updateRoom(
            @RequestHeader("X-User-Id") Long ownerId,
            @PathVariable Long id,
            @Valid @RequestBody RoomRequest request) {

        RoomResponse updatedRoom = roomService.updateRoom(id, request, ownerId);
        return ResponseEntity.ok(updatedRoom);
    }

    // ---------------------- DELETE ----------------------
    @Operation(summary = "Delete a room listing (owner only)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(
            @RequestHeader("X-User-Id") Long ownerId,
            @PathVariable Long id) {

        roomService.deleteRoom(id, ownerId);
        return ResponseEntity.noContent().build();
    }

    // ---------------------- GET MY ROOMS ----------------------
    @Operation(summary = "Get rooms created by the logged-in user")
    @GetMapping("/my-rooms")
    public ResponseEntity<Page<RoomResponse>> getMyRooms(
            @RequestHeader("X-User-Id") Long ownerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<RoomResponse> rooms = roomService.getRoomsByOwner(ownerId, page, size);
        return ResponseEntity.ok(rooms);
    }
    
    @GetMapping("/all-ids")
    public List<Long> getAllRoomIds() {
        return roomService.getAllRoomIds();
    }
}
