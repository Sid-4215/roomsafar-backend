package com.roomsafar.room_service.roomiesync.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RoomieChatMessageResponse {
    private Long id;
    private Long listingId;
    private Long senderId;
    private String senderName;
    private String text;
    private LocalDateTime sentAt;
}
