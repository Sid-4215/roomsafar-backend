package com.roomsafar.room_service.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.roomsafar.room_service.enums.*;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Embedded
    private Address address;

    @Column(nullable = false)
    private Integer rent;

    @Column(nullable = false)
    private Integer deposit;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Furnished furnished;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;

    // ⭐ Enhanced contact fields
    @Column(length = 20)
    private String whatsapp;

    @Column(length = 20)
    private String phone;  // Alternative phone
    
    @Column(length = 100)
    private String instagram; // Social media
    
    @Column(length = 100)
    private String telegram; // Social media
    
    @Column(length = 100)
    private String contactPreference = "WHATSAPP"; // WHATSAPP, PHONE, INSTAGRAM, TELEGRAM

    // ⭐ Brokerage information
    @Column(nullable = false)
    private Boolean brokerageRequired = false;
    
    private Integer brokerageAmount;

    @Column(length = 2000)
    private String description;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("label, sequence")
    private List<RoomImage> images = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "room_amenities", joinColumns = @JoinColumn(name = "room_id"))
    @Column(name = "amenity")
    private List<String> amenities = new ArrayList<>();

    @Column(nullable = false)
    private Long ownerId;

    private LocalDateTime createdAt = LocalDateTime.now();
    
    private LocalDateTime updatedAt = LocalDateTime.now();
}