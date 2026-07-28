package com.roomsafar.room_service.roomiesync.repository;

import com.roomsafar.room_service.roomiesync.entity.RoomieChatMessage;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomieChatMessageRepository extends JpaRepository<RoomieChatMessage, Long> {
    List<RoomieChatMessage> findByListingIdOrderBySentAtAsc(Long listingId);
}
