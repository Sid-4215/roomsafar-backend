package com.roomsafar.user_service.service.impl;

import com.roomsafar.user_service.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class ConsoleEmailService implements EmailService {

    @Override
    public void sendVerificationEmail(String email, String verificationToken) {
        // Log to console for development
        log.info("=== EMAIL VERIFICATION (DEV MODE) ===");
        log.info("To: {}", email);
        log.info("Verification Token: {}", verificationToken);
        log.info("Verification URL: http://localhost:3000/verify?token={}", verificationToken);
        log.info("=== END EMAIL ===");
    }

    @Override
    public void sendPasswordResetEmail(String email, String resetToken) {
        // Log to console for development
        log.info("=== PASSWORD RESET EMAIL (DEV MODE) ===");
        log.info("To: {}", email);
        log.info("Reset Token: {}", resetToken);
        log.info("Reset URL: http://localhost:3000/reset-password?token={}", resetToken);
        log.info("=== END EMAIL ===");
    }
}