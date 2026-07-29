package com.roomsafar.room_service.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/rooms/images")
public class ImageUploadController {

    private static final String UPLOAD_DIR = "/home/runner/workspace/uploads/rooms/";

    /**
     * Serve a previously uploaded image file (public — no auth required).
     */
    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> serveImage(@PathVariable String filename) {
        try {
            // Prevent path-traversal
            if (filename.contains("..") || filename.contains("/")) {
                return ResponseEntity.badRequest().build();
            }
            Path filePath = Paths.get(UPLOAD_DIR).resolve(filename).normalize();
            Resource resource = new FileSystemResource(filePath);
            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) contentType = "image/jpeg";
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                    .body(resource);
        } catch (Exception e) {
            log.error("Failed to serve image '{}': {}", filename, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Upload a room photo (requires authentication — gateway injects X-User-Id).
     * Accepts multipart/form-data with:
     *   - file    : the image file
     *   - baseUrl : the API base URL used to construct the final image URL
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadImage(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "baseUrl", defaultValue = "") String baseUrl) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No file provided"));
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only image files are allowed"));
        }

        // 10 MB limit
        if (file.getSize() > 10L * 1024 * 1024) {
            return ResponseEntity.badRequest().body(Map.of("error", "Image must be under 10 MB"));
        }

        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));

            String ext = resolveExtension(file.getOriginalFilename(), contentType);
            String filename = UUID.randomUUID().toString().replace("-", "") + ext;

            Path target = Paths.get(UPLOAD_DIR).resolve(filename);
            Files.copy(file.getInputStream(), target);

            log.info("Image uploaded by user {}: {}", userId, filename);

            String imageUrl = baseUrl + "/api/rooms/images/" + filename;
            Map<String, String> response = new HashMap<>();
            response.put("filename", filename);
            response.put("url", imageUrl);
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            log.error("Failed to save uploaded image", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to save image. Please try again."));
        }
    }

    private String resolveExtension(String originalName, String contentType) {
        if (originalName != null && originalName.contains(".")) {
            String ext = originalName.substring(originalName.lastIndexOf('.')).toLowerCase();
            if (ext.matches("\\.(jpg|jpeg|png|webp|gif|heic)")) return ext;
        }
        return switch (contentType) {
            case "image/png"  -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif"  -> ".gif";
            default           -> ".jpg";
        };
    }
}
