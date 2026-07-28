package com.roomsafar.room_service.exception.custom;

public class RoomNotFoundException extends RuntimeException {
    private static final long serialVersionUID = 1L; // Add this line

    public RoomNotFoundException(Long id) {
        super("Room not found with id: " + id);
    }
    
    public RoomNotFoundException(String message) {
        super(message);
    }
}