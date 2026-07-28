package com.roomsafar.room_service.roomiesync.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RoomieContactRequestResponse {
    private Long id;
    private Long listingId;
    private Long requesterId;
    private String status;
    private LocalDateTime requestedAt;
}
