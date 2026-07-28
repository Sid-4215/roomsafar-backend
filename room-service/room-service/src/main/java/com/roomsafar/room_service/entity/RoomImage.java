package com.roomsafar.room_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "room_images")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 500)
    private String imageUrl;  // Cloudinary URL

    @Column(length = 50)
    private String label = "OTHER"; // BEDROOM, HALL, KITCHEN, BATHROOM, EXTERIOR, OTHER
    
    private Integer sequence = 0; // For ordering
    
    @Column(length = 200)
    private String caption; // Optional caption

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;
}