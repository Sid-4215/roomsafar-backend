package com.roomsafar.favorites_service.service.impl;

import com.roomsafar.favorites_service.dto.FavoriteResponse;
import com.roomsafar.favorites_service.entity.Favorite;
import com.roomsafar.favorites_service.repository.FavoriteRepository;
import com.roomsafar.favorites_service.service.FavoritesService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FavoritesServiceImpl implements FavoritesService {

    private final FavoriteRepository favoriteRepository;

    @Override
    @Transactional
    public FavoriteResponse addToFavorites(Long userId, Long roomId) {
        log.info("Adding room {} to favorites for user {}", roomId, userId);
        
        // Check if already favorited
        if (favoriteRepository.existsByUserIdAndRoomId(userId, roomId)) {
            throw new RuntimeException("Room already in favorites");
        }

        Favorite favorite = new Favorite();
        favorite.setUserId(userId);
        favorite.setRoomId(roomId);
        
        Favorite saved = favoriteRepository.save(favorite);
        
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void removeFromFavorites(Long userId, Long roomId) {
        log.info("Removing room {} from favorites for user {}", roomId, userId);
        
        Favorite favorite = favoriteRepository.findByUserIdAndRoomId(userId, roomId)
                .orElseThrow(() -> new RuntimeException("Favorite not found"));
        
        favoriteRepository.delete(favorite);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FavoriteResponse> getUserFavorites(Long userId) {
        log.info("Fetching favorites for user {}", userId);
        
        return favoriteRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isRoomFavorited(Long userId, Long roomId) {
        return favoriteRepository.existsByUserIdAndRoomId(userId, roomId);
    }

    private FavoriteResponse mapToResponse(Favorite favorite) {
        FavoriteResponse response = new FavoriteResponse();
        response.setId(favorite.getId());
        response.setUserId(favorite.getUserId());
        response.setRoomId(favorite.getRoomId());
        response.setCreatedAt(favorite.getCreatedAt());
        return response;
    }
}