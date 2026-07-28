package com.roomsafar.room_service.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import com.roomsafar.model.projection.RoomIdProjection;
import com.roomsafar.room_service.entity.Room;

public interface RoomRepository extends JpaRepository<Room, Long>, JpaSpecificationExecutor<Room> {

    List<Room> findByAddressAreaContainingIgnoreCase(String area);

    List<Room> findByRentLessThanEqual(Integer rent);
    
    Page<Room> findByOwnerId(Long ownerId, Pageable pageable);

    @Query("SELECT r.id AS id FROM Room r")
    List<RoomIdProjection> findAllRoomIds();
    // existing @Query searchByAreaAndRent can stay or be removed if unused
}
