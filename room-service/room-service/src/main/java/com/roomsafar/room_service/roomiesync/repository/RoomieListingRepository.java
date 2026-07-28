package com.roomsafar.room_service.roomiesync.repository;

import com.roomsafar.room_service.roomiesync.entity.RoomieListing;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface RoomieListingRepository extends JpaRepository<RoomieListing, Long>, JpaSpecificationExecutor<RoomieListing> {
    Page<RoomieListing> findByOwnerId(Long ownerId, Pageable pageable);
}
