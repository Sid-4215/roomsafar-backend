package com.roomsafar.user_service.service;

import com.google.api.client.http.GenericUrl;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.gson.Gson;
import com.roomsafar.user_service.entity.User;
import com.roomsafar.user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleService {

    private final UserRepository userRepository;

    @Value("${google.clientId}")
    private String googleClientId;

    @Transactional
    public User verify(String idToken) {
        try {
            if (idToken == null || idToken.isBlank()) {
                throw new RuntimeException("ID token missing");
            }

            log.info("🔎 Verifying Google token via tokeninfo API...");

            String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;

            String response = new NetHttpTransport()
                    .createRequestFactory()
                    .buildGetRequest(new GenericUrl(url))
                    .execute()
                    .parseAsString();

            Map<String, Object> payload = new Gson().fromJson(response, Map.class);

            if (payload == null || payload.get("email") == null) {
                throw new RuntimeException("Invalid Google token");
            }

            // Validate audience
            String aud = (String) payload.get("aud");
            if (!googleClientId.equals(aud)) {
                throw new RuntimeException("Invalid audience. Token not meant for this app");
            }

            String email = (String) payload.get("email");
            String name = (String) payload.get("name");
            String picture = (String) payload.get("picture");
            String googleId = (String) payload.get("sub");

            // Find existing user
            User user = userRepository.findByGoogleId(googleId).orElse(null);
            if (user == null) user = userRepository.findByEmail(email).orElse(null);

            if (user != null) {
                log.info("Updating existing Google user: {}", email);

                user.setGoogleId(googleId);
                user.setGoogleUser(true);
                user.setEmailVerified(true);

                if (name != null) user.setName(name);
                if (picture != null) user.setProfileImage(picture);

                return userRepository.save(user);
            }

            // Create new Google user
            log.info("Creating new Google user: {}", email);

            user = User.builder()
                    .name(name != null ? name : email.split("@")[0])
                    .email(email)
                    .password("GOOGLE_" + UUID.randomUUID()) // never used
                    .role("USER")
                    .googleId(googleId)
                    .isGoogleUser(true)
                    .emailVerified(true)
                    .profileImage(picture)
                    .active(true)
                    .build();

            return userRepository.save(user);

        } catch (Exception e) {
            log.error("Google login failed: {}", e.getMessage());
            throw new RuntimeException("Google login failed: " + e.getMessage());
        }
    }
}
