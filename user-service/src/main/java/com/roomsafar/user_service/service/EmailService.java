package com.roomsafar.user_service.service;

public interface EmailService {
    void sendVerificationEmail(String email, String verificationToken);
    void sendPasswordResetEmail(String email, String resetToken);
}