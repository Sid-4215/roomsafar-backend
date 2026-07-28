package com.roomsafar.room_service.dto;

import lombok.Data;

@Data
public class RoomImageRequest {
    private String url;
    private String label = "OTHER";
    private String caption;
    private Integer sequence = 0;
}