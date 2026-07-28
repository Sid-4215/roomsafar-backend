package com.roomsafar.room_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Address {

    @Column(length = 500)
    private String line1;

    @Column(length = 200)
    private String area;

    @Column(length = 200)
    private String city;

    @Column(length = 200)
    private String state;

    @Column(length = 10)
    private String pincode;

    private Double latitude;
    private Double longitude;
}
