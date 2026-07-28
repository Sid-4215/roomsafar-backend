package com.roomsafar.user_service.controller;

import com.roomsafar.user_service.dto.*;
import com.roomsafar.user_service.entity.User;
import com.roomsafar.user_service.security.JwtUtil;
import com.roomsafar.user_service.service.AuthService;
import com.roomsafar.user_service.service.GoogleService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final GoogleService googleService;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest req) {
        try {
            log.info("Register request received for email: {}", req.getEmail());
            AuthResponse response = authService.register(req);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Registration error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new AuthResponse(null, null, null, null, e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        try {
            log.info("Login request received for email: {}", req.getEmail());
            AuthResponse response = authService.login(req);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Login error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse(null, null, null, null, e.getMessage()));
        }
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(@RequestBody GoogleLoginRequest req) {
        try {
            log.info("Google login request received");

            if (req.getIdToken() == null || req.getIdToken().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new AuthResponse(null, null, null, null, "ID Token is required"));
            }

            User user = googleService.verify(req.getIdToken());
            String token = jwtUtil.generateToken(user);

            log.info("Google login successful for user: {}", user.getEmail());

            return ResponseEntity.ok(
                    new AuthResponse(token, user.getName(), user.getEmail(), user.getRole())
            );

        } catch (Exception e) {
            log.error("Google login error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse(null, null, null, null,
                            "Google authentication failed: " + e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(@RequestHeader(value = "Authorization", required = false) String header) {
        try {
            if (header == null || !header.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Missing or invalid Authorization header"));
            }

            String token = header.replace("Bearer ", "").trim();
            User user = authService.getMe(token);

            user.setPassword(null);
            return ResponseEntity.ok(user);

        } catch (Exception e) {
            log.error("Get me error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Invalid or expired token"));
        }
    }

    @Data
    @RequiredArgsConstructor
    public static class ErrorResponse {
        private final String error;
        private final String timestamp = Instant.now().toString();
    }

    @RequestMapping(value = "/**", method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleOptions() {
        return ResponseEntity.ok().build();
    }
}
