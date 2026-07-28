package com.roomsafar.room_service.roomiesync.controller;

import com.roomsafar.room_service.roomiesync.dto.RoomieChatMessageRequest;
import com.roomsafar.room_service.roomiesync.dto.RoomieChatMessageResponse;
import com.roomsafar.room_service.roomiesync.dto.RoomieContactRequestResponse;
import com.roomsafar.room_service.roomiesync.dto.RoomieListingRequest;
import com.roomsafar.room_service.roomiesync.dto.RoomieListingResponse;
import com.roomsafar.room_service.roomiesync.enums.RoomieListingType;
import com.roomsafar.room_service.roomiesync.service.RoomieSyncService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
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

@RestController
@RequestMapping("/api/roomiesync/listings")
@RequiredArgsConstructor
public class RoomieSyncController {

    private final RoomieSyncService roomieSyncService;

    @PostMapping
    public ResponseEntity<RoomieListingResponse> createListing(
            @RequestHeader("X-User-Id") Long ownerId,
            @Valid @RequestBody RoomieListingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(roomieSyncService.createListing(request, ownerId));
    }

    @GetMapping
    public ResponseEntity<Page<RoomieListingResponse>> searchListings(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) RoomieListingType listingType,
            @RequestParam(required = false) Integer minRent,
            @RequestParam(required = false) Integer maxRent,
            @RequestParam(required = false) String genderPreference,
            @RequestParam(required = false) String occupationPreference,
            @RequestParam(required = false) Boolean furnished,
            @RequestParam(required = false) String roomType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(roomieSyncService.searchListings(
                query,
                listingType,
                minRent,
                maxRent,
                genderPreference,
                occupationPreference,
                furnished,
                roomType,
                page,
                size
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomieListingResponse> getListing(@PathVariable Long id) {
        return ResponseEntity.ok(roomieSyncService.getListing(id));
    }

    @GetMapping("/my")
    public ResponseEntity<Page<RoomieListingResponse>> getMyListings(
            @RequestHeader("X-User-Id") Long ownerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(roomieSyncService.getMyListings(ownerId, page, size));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoomieListingResponse> updateListing(
            @RequestHeader("X-User-Id") Long ownerId,
            @PathVariable Long id,
            @Valid @RequestBody RoomieListingRequest request) {
        return ResponseEntity.ok(roomieSyncService.updateListing(id, request, ownerId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteListing(
            @RequestHeader("X-User-Id") Long ownerId,
            @PathVariable Long id) {
        roomieSyncService.deleteListing(id, ownerId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/contact-request")
    public ResponseEntity<RoomieContactRequestResponse> requestContact(
            @RequestHeader("X-User-Id") Long requesterId,
            @PathVariable Long id) {
        return ResponseEntity.ok(roomieSyncService.requestContact(id, requesterId));
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<List<RoomieChatMessageResponse>> getMessages(@PathVariable Long id) {
        return ResponseEntity.ok(roomieSyncService.getMessages(id));
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<RoomieChatMessageResponse> sendMessage(
            @RequestHeader("X-User-Id") Long senderId,
            @PathVariable Long id,
            @Valid @RequestBody RoomieChatMessageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(roomieSyncService.sendMessage(id, senderId, request));
    }
}
