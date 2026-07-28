package com.roomsafar.room_service.roomiesync.entity;

import com.roomsafar.room_service.roomiesync.enums.RoomieListingType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "roomie_listings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomieListing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long ownerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private RoomieListingType listingType;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(length = 2500)
    private String description;

    @Column(nullable = false, length = 160)
    private String area;

    @Column(nullable = false, length = 120)
    private String city;

    @Column(length = 12)
    private String pincode;

    private Integer totalRent;

    @Column(nullable = false)
    private Integer rentShare;

    private Integer deposit;

    private Integer totalRoommates;

    private Integer spotsAvailable;

    @Column(nullable = false, length = 40)
    private String roomType;

    @Column(nullable = false)
    private Boolean furnished;

    @Column(nullable = false, length = 30)
    private String genderPreference;

    @Column(nullable = false, length = 30)
    private String occupationPreference;

    @ElementCollection
    @CollectionTable(name = "roomie_listing_amenities", joinColumns = @JoinColumn(name = "listing_id"))
    @Column(name = "amenity", length = 100)
    private List<String> amenities = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "roomie_listing_photos", joinColumns = @JoinColumn(name = "listing_id"))
    @Lob
    @Column(name = "photo_data", columnDefinition = "TEXT")
    private List<String> photos = new ArrayList<>();

    @Column(nullable = false, length = 100)
    private String contactName;

    @Column(nullable = false, length = 30)
    private String contactPhone;

    private LocalDate availableFrom;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
