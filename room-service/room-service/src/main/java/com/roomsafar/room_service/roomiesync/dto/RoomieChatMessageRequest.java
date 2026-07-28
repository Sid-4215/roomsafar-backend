package com.roomsafar.room_service.roomiesync.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RoomieChatMessageRequest {

    @NotBlank(message = "Sender name is required")
    @Size(max = 100, message = "Sender name cannot exceed 100 characters")
    private String senderName;

    @NotBlank(message = "Message is required")
    @Size(max = 1200, message = "Message cannot exceed 1200 characters")
    private String text;
}
