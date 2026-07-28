package com.roomsafar.favorites_service.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FavoriteResponse {
    private Long id;
    private Long userId;
    private Long roomId;
    private LocalDateTime createdAt;
}