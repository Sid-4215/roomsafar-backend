package com.roomsafar.favorites_service.service;

import com.roomsafar.favorites_service.dto.FavoriteResponse;
import java.util.List;

public interface FavoritesService {
    FavoriteResponse addToFavorites(Long userId, Long roomId);
    void removeFromFavorites(Long userId, Long roomId);
    List<FavoriteResponse> getUserFavorites(Long userId);
    boolean isRoomFavorited(Long userId, Long roomId);
}