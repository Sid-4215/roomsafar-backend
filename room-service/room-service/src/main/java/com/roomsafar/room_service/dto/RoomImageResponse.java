package com.roomsafar.room_service.dto;

import lombok.Data;

@Data
public class RoomImageResponse {
    private Long id;
    private String url;
    private String label;
    private String caption;
    private Integer sequence;
}