package com.roomsafar.favorites_service.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.roomsafar.favorites_service.dto.FavoriteRequest;
import com.roomsafar.favorites_service.dto.FavoriteResponse;
import com.roomsafar.favorites_service.service.FavoritesService;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoritesController {

    private final FavoritesService favoritesService;

    @PostMapping
    public ResponseEntity<FavoriteResponse> addToFavorites(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody FavoriteRequest request) {
        
        try {
            Long userLongId = Long.parseLong(userId);
            FavoriteResponse response = favoritesService.addToFavorites(userLongId, request.getRoomId());
            return ResponseEntity.ok(response);
        } catch (NumberFormatException e) {
            log.error("Invalid user ID format: {}", userId);
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{roomId}")
    public ResponseEntity<Void> removeFromFavorites(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable Long roomId) {
        
        try {
            Long userLongId = Long.parseLong(userId);
            favoritesService.removeFromFavorites(userLongId, roomId);
            return ResponseEntity.noContent().build();
        } catch (NumberFormatException e) {
            log.error("Invalid user ID format: {}", userId);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<FavoriteResponse>> getUserFavorites(
            @RequestHeader("X-User-Id") String userId) {
        
        try {
            Long userLongId = Long.parseLong(userId);
            List<FavoriteResponse> favorites = favoritesService.getUserFavorites(userLongId);
            return ResponseEntity.ok(favorites);
        } catch (NumberFormatException e) {
            log.error("Invalid user ID format: {}", userId);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/check/{roomId}")
    public ResponseEntity<Boolean> checkIfFavorited(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable Long roomId) {
        
        try {
            Long userLongId = Long.parseLong(userId);
            boolean isFavorited = favoritesService.isRoomFavorited(userLongId, roomId);
            return ResponseEntity.ok(isFavorited);
        } catch (NumberFormatException e) {
            log.error("Invalid user ID format: {}", userId);
            return ResponseEntity.badRequest().build();
        }
    }
}