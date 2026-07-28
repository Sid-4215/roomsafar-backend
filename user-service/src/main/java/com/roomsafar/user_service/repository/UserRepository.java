package com.roomsafar.user_service.repository;

import com.roomsafar.user_service.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    
    // Add this method for verification token
    Optional<User> findByVerificationToken(String verificationToken);
    
    // Find by Google ID
    Optional<User> findByGoogleId(String googleId);
    
    @Query("SELECT u FROM User u WHERE u.email = :email AND u.active = true")
    Optional<User> findActiveByEmail(String email);
}