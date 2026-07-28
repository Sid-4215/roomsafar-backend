package com.roomsafar.room_service.roomiesync.service;

import com.roomsafar.room_service.roomiesync.dto.RoomieChatMessageRequest;
import com.roomsafar.room_service.roomiesync.dto.RoomieChatMessageResponse;
import com.roomsafar.room_service.roomiesync.dto.RoomieContactRequestResponse;
import com.roomsafar.room_service.roomiesync.dto.RoomieListingRequest;
import com.roomsafar.room_service.roomiesync.dto.RoomieListingResponse;
import com.roomsafar.room_service.roomiesync.entity.RoomieChatMessage;
import com.roomsafar.room_service.roomiesync.entity.RoomieContactRequest;
import com.roomsafar.room_service.roomiesync.entity.RoomieListing;
import com.roomsafar.room_service.roomiesync.enums.RoomieListingType;
import com.roomsafar.room_service.roomiesync.repository.RoomieChatMessageRepository;
import com.roomsafar.room_service.roomiesync.repository.RoomieContactRequestRepository;
import com.roomsafar.room_service.roomiesync.repository.RoomieListingRepository;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RoomieSyncService {

    private final RoomieListingRepository listingRepository;
    private final RoomieContactRequestRepository contactRequestRepository;
    private final RoomieChatMessageRepository chatMessageRepository;

    @Transactional
    public RoomieListingResponse createListing(RoomieListingRequest request, Long ownerId) {
        RoomieListing listing = new RoomieListing();
        applyRequest(listing, request);
        listing.setOwnerId(ownerId);
        return toListingResponse(listingRepository.save(listing));
    }

    public Page<RoomieListingResponse> searchListings(
            String query,
            RoomieListingType listingType,
            Integer minRent,
            Integer maxRent,
            String genderPreference,
            String occupationPreference,
            Boolean furnished,
            String roomType,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Specification<RoomieListing> spec = (root, criteriaQuery, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (query != null && !query.isBlank()) {
                String q = "%" + query.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), q),
                        cb.like(cb.lower(root.get("area")), q),
                        cb.like(cb.lower(root.get("city")), q)
                ));
            }

            if (listingType != null) {
                predicates.add(cb.equal(root.get("listingType"), listingType));
            }

            if (minRent != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("rentShare"), minRent));
            }

            if (maxRent != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("rentShare"), maxRent));
            }

            if (genderPreference != null && !genderPreference.isBlank() && !"ANY".equalsIgnoreCase(genderPreference)) {
                predicates.add(cb.or(
                        cb.equal(cb.upper(root.get("genderPreference")), "ANY"),
                        cb.equal(cb.upper(root.get("genderPreference")), genderPreference.toUpperCase())
                ));
            }

            if (occupationPreference != null && !occupationPreference.isBlank() && !"ANY".equalsIgnoreCase(occupationPreference)) {
                predicates.add(cb.or(
                        cb.equal(cb.upper(root.get("occupationPreference")), "ANY"),
                        cb.equal(cb.upper(root.get("occupationPreference")), occupationPreference.toUpperCase())
                ));
            }

            if (furnished != null) {
                predicates.add(cb.equal(root.get("furnished"), furnished));
            }

            if (roomType != null && !roomType.isBlank() && !"ANY".equalsIgnoreCase(roomType)) {
                predicates.add(cb.equal(cb.upper(root.get("roomType")), roomType.toUpperCase()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return listingRepository.findAll(spec, pageable).map(this::toListingResponse);
    }

    public RoomieListingResponse getListing(Long id) {
        return toListingResponse(findListing(id));
    }

    public Page<RoomieListingResponse> getMyListings(Long ownerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return listingRepository.findByOwnerId(ownerId, pageable).map(this::toListingResponse);
    }

    @Transactional
    public RoomieListingResponse updateListing(Long id, RoomieListingRequest request, Long ownerId) {
        RoomieListing listing = findListing(id);
        ensureOwner(listing, ownerId);
        applyRequest(listing, request);
        return toListingResponse(listingRepository.save(listing));
    }

    @Transactional
    public void deleteListing(Long id, Long ownerId) {
        RoomieListing listing = findListing(id);
        ensureOwner(listing, ownerId);
        listingRepository.delete(listing);
    }

    @Transactional
    public RoomieContactRequestResponse requestContact(Long listingId, Long requesterId) {
        findListing(listingId);
        RoomieContactRequest request = contactRequestRepository
                .findByListingIdAndRequesterId(listingId, requesterId)
                .orElseGet(() -> {
                    RoomieContactRequest newRequest = new RoomieContactRequest();
                    newRequest.setListingId(listingId);
                    newRequest.setRequesterId(requesterId);
                    newRequest.setStatus("APPROVED");
                    return contactRequestRepository.save(newRequest);
                });
        return toContactResponse(request);
    }

    public List<RoomieChatMessageResponse> getMessages(Long listingId) {
        findListing(listingId);
        return chatMessageRepository.findByListingIdOrderBySentAtAsc(listingId)
                .stream()
                .map(this::toMessageResponse)
                .toList();
    }

    @Transactional
    public RoomieChatMessageResponse sendMessage(Long listingId, Long senderId, RoomieChatMessageRequest request) {
        findListing(listingId);
        RoomieChatMessage message = new RoomieChatMessage();
        message.setListingId(listingId);
        message.setSenderId(senderId);
        message.setSenderName(request.getSenderName());
        message.setText(request.getText());
        return toMessageResponse(chatMessageRepository.save(message));
    }

    private RoomieListing findListing(Long id) {
        return listingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("RoomieSync listing not found: " + id));
    }

    private void ensureOwner(RoomieListing listing, Long ownerId) {
        if (!listing.getOwnerId().equals(ownerId)) {
            throw new IllegalArgumentException("UNAUTHORIZED: You cannot change this listing.");
        }
    }

    private void applyRequest(RoomieListing listing, RoomieListingRequest request) {
        listing.setListingType(request.getListingType());
        listing.setTitle(request.getTitle());
        listing.setDescription(request.getDescription());
        listing.setArea(request.getArea());
        listing.setCity(request.getCity());
        listing.setPincode(request.getPincode());
        listing.setTotalRent(request.getTotalRent());
        listing.setRentShare(request.getRentShare());
        listing.setDeposit(request.getDeposit());
        listing.setTotalRoommates(request.getTotalRoommates());
        listing.setSpotsAvailable(request.getSpotsAvailable());
        listing.setRoomType(request.getRoomType());
        listing.setFurnished(request.getFurnished());
        listing.setGenderPreference(request.getGenderPreference());
        listing.setOccupationPreference(request.getOccupationPreference());
        listing.setAmenities(request.getAmenities() != null ? request.getAmenities() : new ArrayList<>());
        listing.setPhotos(request.getPhotos() != null ? request.getPhotos() : new ArrayList<>());
        listing.setContactName(request.getContactName());
        listing.setContactPhone(request.getContactPhone());
        listing.setAvailableFrom(request.getAvailableFrom());
    }

    private RoomieListingResponse toListingResponse(RoomieListing listing) {
        return RoomieListingResponse.builder()
                .id(listing.getId())
                .ownerId(listing.getOwnerId())
                .listingType(listing.getListingType())
                .title(listing.getTitle())
                .description(listing.getDescription())
                .area(listing.getArea())
                .city(listing.getCity())
                .pincode(listing.getPincode())
                .totalRent(listing.getTotalRent())
                .rentShare(listing.getRentShare())
                .deposit(listing.getDeposit())
                .totalRoommates(listing.getTotalRoommates())
                .spotsAvailable(listing.getSpotsAvailable())
                .roomType(listing.getRoomType())
                .furnished(listing.getFurnished())
                .genderPreference(listing.getGenderPreference())
                .occupationPreference(listing.getOccupationPreference())
                .amenities(listing.getAmenities())
                .photos(listing.getPhotos())
                .contactName(listing.getContactName())
                .contactPhone(listing.getContactPhone())
                .availableFrom(listing.getAvailableFrom())
                .createdAt(listing.getCreatedAt())
                .updatedAt(listing.getUpdatedAt())
                .build();
    }

    private RoomieContactRequestResponse toContactResponse(RoomieContactRequest request) {
        return RoomieContactRequestResponse.builder()
                .id(request.getId())
                .listingId(request.getListingId())
                .requesterId(request.getRequesterId())
                .status(request.getStatus())
                .requestedAt(request.getRequestedAt())
                .build();
    }

    private RoomieChatMessageResponse toMessageResponse(RoomieChatMessage message) {
        return RoomieChatMessageResponse.builder()
                .id(message.getId())
                .listingId(message.getListingId())
                .senderId(message.getSenderId())
                .senderName(message.getSenderName())
                .text(message.getText())
                .sentAt(message.getSentAt())
                .build();
    }
}
