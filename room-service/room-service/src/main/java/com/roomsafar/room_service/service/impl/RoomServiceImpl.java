package com.roomsafar.room_service.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.roomsafar.model.projection.RoomIdProjection;
import com.roomsafar.room_service.dto.RoomImageRequest;
import com.roomsafar.room_service.dto.RoomRequest;
import com.roomsafar.room_service.dto.RoomResponse;
import com.roomsafar.room_service.entity.Room;
import com.roomsafar.room_service.entity.RoomImage;
import com.roomsafar.room_service.enums.Furnished;
import com.roomsafar.room_service.enums.Gender;
import com.roomsafar.room_service.enums.RoomType;
import com.roomsafar.room_service.exception.custom.RoomNotFoundException;
import com.roomsafar.room_service.mapper.RoomMapper;
import com.roomsafar.room_service.repository.RoomRepository;
import com.roomsafar.room_service.service.RoomService;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final RoomMapper roomMapper;

    @Override
    @Transactional
    public RoomResponse createRoom(RoomRequest request, Long ownerId) {
        Room room = new Room();
        room.setOwnerId(ownerId);
        
        // Basic info
        room.setRent(request.getRent());
        room.setDeposit(request.getDeposit());
        room.setType(request.getType());
        room.setFurnished(request.getFurnished());
        room.setGender(request.getGender());
        room.setDescription(request.getDescription());
        room.setAddress(request.getAddress());
        
        // ⭐ Enhanced contact info
        room.setWhatsapp(request.getWhatsapp());
        room.setPhone(request.getPhone());
        room.setInstagram(request.getInstagram());
        room.setTelegram(request.getTelegram());
        room.setContactPreference(request.getContactPreference());
        
        // ⭐ Brokerage info
        room.setBrokerageRequired(request.getBrokerageRequired());
        if (request.getBrokerageRequired() && request.getBrokerageAmount() != null) {
            room.setBrokerageAmount(request.getBrokerageAmount());
        }
        
        // ⭐ Amenities
        if (request.getAmenities() != null) {
            room.setAmenities(request.getAmenities());
        }
        
        // ⭐ Enhanced images with labels
        if (request.getImages() != null) {
            int sequence = 0;
            for (RoomImageRequest imgReq : request.getImages()) {
                RoomImage image = new RoomImage();
                image.setImageUrl(imgReq.getUrl());
                image.setLabel(imgReq.getLabel() != null ? imgReq.getLabel() : "OTHER");
                image.setCaption(imgReq.getCaption());
                image.setSequence(imgReq.getSequence() != null ? imgReq.getSequence() : sequence++);
                image.setRoom(room);
                room.getImages().add(image);
            }
        }
        
        room = roomRepository.save(room);
        log.info("Room created successfully with ID: {}", room.getId());
        return roomMapper.toResponse(room);
    }
    
    @Override
    public Page<RoomResponse> getAllRooms(int page, int size, String sortBy, String sortDir) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Room> roomPage = roomRepository.findAll(pageable);
        List<RoomResponse> dtoList = roomMapper.toResponseList(roomPage.getContent());

        return new PageImpl<>(dtoList, pageable, roomPage.getTotalElements());
    }

    @Override
    public RoomResponse getRoomById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RoomNotFoundException(id));

        return roomMapper.toResponse(room);
    }

    @Override
    public Page<RoomResponse> search(
            String area,
            String city,
            String type,
            String furnished,
            String gender,
            Integer minRent,
            Integer maxRent,
            String createdOn,
            String startDate,
            String endDate,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {

        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Room> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // ------- Area -------
            if (area != null && !area.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("address").get("area")),
                        "%" + area.toLowerCase() + "%"));
            }

            // ------- City -------
            if (city != null && !city.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("address").get("city")),
                        "%" + city.toLowerCase() + "%"));
            }

            // ------- Rent -------
            if (minRent != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("rent"), minRent));
            }
            if (maxRent != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("rent"), maxRent));
            }

            // ------- Type -------
            if (type != null && !type.isBlank()) {
                try { 
                    predicates.add(cb.equal(root.get("type"), RoomType.valueOf(type))); 
                } catch (Exception ignored) {}
            }

            // ------- Furnished -------
            if (furnished != null && !furnished.isBlank()) {
                try { 
                    predicates.add(cb.equal(root.get("furnished"), Furnished.valueOf(furnished))); 
                } catch (Exception ignored) {}
            }

            // ------- Gender -------
            if (gender != null && !gender.isBlank()) {
                try { 
                    predicates.add(cb.equal(root.get("gender"), Gender.valueOf(gender))); 
                } catch (Exception ignored) {}
            }

            // ------- DATE FILTER — Single Date -------
            if (createdOn != null && !createdOn.isBlank()) {
                LocalDate date = LocalDate.parse(createdOn);
                LocalDateTime start = date.atStartOfDay();
                LocalDateTime end = date.atTime(23, 59, 59);
                predicates.add(cb.between(root.get("createdAt"), start, end));
            }

            // ------- DATE RANGE FILTER -------
            if (startDate != null && endDate != null) {
                LocalDateTime start = LocalDate.parse(startDate).atStartOfDay();
                LocalDateTime end = LocalDate.parse(endDate).atTime(23, 59, 59);
                predicates.add(cb.between(root.get("createdAt"), start, end));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Room> roomPage = roomRepository.findAll(spec, pageable);
        List<RoomResponse> dtoList = roomMapper.toResponseList(roomPage.getContent());

        return new PageImpl<>(dtoList, pageable, roomPage.getTotalElements());
    }

    @Override
    @Transactional
    public RoomResponse updateRoom(Long id, RoomRequest request, Long ownerId) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RoomNotFoundException(id));

        if (!room.getOwnerId().equals(ownerId)) {
            throw new RuntimeException("UNAUTHORIZED: You cannot update this room.");
        }

        // Update basic fields
        room.setRent(request.getRent());
        room.setDeposit(request.getDeposit());
        room.setType(request.getType());
        room.setFurnished(request.getFurnished());
        room.setGender(request.getGender());
        room.setWhatsapp(request.getWhatsapp());
        room.setDescription(request.getDescription());
        room.setAddress(request.getAddress());
        
        // Update enhanced contact info
        room.setPhone(request.getPhone());
        room.setInstagram(request.getInstagram());
        room.setTelegram(request.getTelegram());
        room.setContactPreference(request.getContactPreference());
        
        // Update brokerage info
        room.setBrokerageRequired(request.getBrokerageRequired());
        if (request.getBrokerageRequired() && request.getBrokerageAmount() != null) {
            room.setBrokerageAmount(request.getBrokerageAmount());
        } else {
            room.setBrokerageAmount(null);
        }
        
        // Update amenities
        room.setAmenities(request.getAmenities() != null ? request.getAmenities() : new ArrayList<>());

        // Update images
        room.getImages().clear();
        if (request.getImages() != null) {
            int sequence = 0;
            for (RoomImageRequest imgReq : request.getImages()) {
                RoomImage image = new RoomImage();
                image.setImageUrl(imgReq.getUrl());
                image.setLabel(imgReq.getLabel() != null ? imgReq.getLabel() : "OTHER");
                image.setCaption(imgReq.getCaption());
                image.setSequence(imgReq.getSequence() != null ? imgReq.getSequence() : sequence++);
                image.setRoom(room);
                room.getImages().add(image);
            }
        }

        room.setUpdatedAt(LocalDateTime.now());
        room = roomRepository.save(room);
        log.info("Room updated successfully with ID: {}", room.getId());
        return roomMapper.toResponse(room);
    }

    @Override
    @Transactional
    public void deleteRoom(Long id, Long ownerId) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RoomNotFoundException(id));

        if (!room.getOwnerId().equals(ownerId)) {
            throw new RuntimeException("UNAUTHORIZED: You cannot delete this room.");
        }

        roomRepository.delete(room);
        log.info("Room deleted successfully with ID: {}", id);
    }

    @Override
    public Page<RoomResponse> getRoomsByOwner(Long ownerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Room> roomPage = roomRepository.findByOwnerId(ownerId, pageable);
        List<RoomResponse> dtoList = roomMapper.toResponseList(roomPage.getContent());
        return new PageImpl<>(dtoList, pageable, roomPage.getTotalElements());
    }
    
    @Override
    public List<Long> getAllRoomIds() {
        return roomRepository.findAllRoomIds()
                .stream()
                .map(RoomIdProjection::getId)
                .toList();
    }
}