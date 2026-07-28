package com.roomsafar.room_service.roomiesync.repository;

import com.roomsafar.room_service.roomiesync.entity.RoomieContactRequest;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomieContactRequestRepository extends JpaRepository<RoomieContactRequest, Long> {
    Optional<RoomieContactRequest> findByListingIdAndRequesterId(Long listingId, Long requesterId);
}
