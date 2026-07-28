package com.roomsafar.room_service.roomiesync.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "roomie_contact_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomieContactRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long listingId;

    @Column(nullable = false)
    private Long requesterId;

    @Column(nullable = false, length = 30)
    private String status = "APPROVED";

    private LocalDateTime requestedAt;

    @PrePersist
    void onCreate() {
        requestedAt = LocalDateTime.now();
    }
}
