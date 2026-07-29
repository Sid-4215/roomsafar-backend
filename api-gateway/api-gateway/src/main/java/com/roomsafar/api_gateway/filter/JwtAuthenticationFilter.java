package com.roomsafar.api_gateway.filter;

import java.nio.charset.StandardCharsets;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    @Value("${jwt.secret}")
    private String secret;

    private static final List<String> PUBLIC_PATHS = List.of(
            "/auth/login",
            "/auth/register", 
            "/auth/google",
            "/auth/me",
            "/auth/reset-password",
            "/auth/reset-password/confirm",
            "/swagger-ui/**",
            "/v3/api-docs/**",
            "/webjars/**",
            "/eureka/**",
            "/actuator/**",
            "/fallback/**"
    );

    // GET paths under /api/rooms that require authentication (must not be treated as public)
    private static final List<String> PROTECTED_ROOM_GET_PATHS = List.of(
            "/api/rooms/my-rooms"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();
        String method = exchange.getRequest().getMethod().name();

        log.debug("🔍 Gateway Filter - Path: {}, Method: {}", path, method);

        // Allow all OPTIONS requests for CORS preflight
        if ("OPTIONS".equalsIgnoreCase(method)) {
            return chain.filter(exchange);
        }

        if (isPublicPath(path, method)) {
            log.debug("✅ Public route allowed: {}", path);
            return chain.filter(exchange);
        }

        HttpHeaders headers = exchange.getRequest().getHeaders();
        String authHeader = headers.getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("❌ Missing or invalid Authorization header for path: {}", path);
            return unauthorized(exchange, "Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7).trim();

        try {
            // Validate JWT token
            Claims claims = Jwts.parser()
                    .verifyWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String email = claims.getSubject();
            String role = claims.get("role", String.class);
            String userId = claims.get("userId", String.class);
            String name = claims.get("name", String.class);

            if (email == null || email.isEmpty()) {
                throw new RuntimeException("Invalid token: missing email");
            }

            log.info("✅ Token valid - User: {}, Email: {}, Role: {}", name, email, role);

            // Add user info to headers for downstream services
            ServerWebExchange mutated = exchange.mutate()
                    .request(builder -> builder
                            .header("X-User-Email", email)
                            .header("X-User-Id", userId != null ? userId : "")
                            .header("X-User-Role", role != null ? role : "USER")
                            .header("X-User-Name", name != null ? name : ""))
                    .build();

            return chain.filter(mutated);

        } catch (Exception e) {
            log.error("❌ Token validation failed: {}", e.getMessage());
            return unauthorized(exchange, "Invalid or expired token: " + e.getMessage());
        }
    }

    private boolean isPublicPath(String path, String method) {
        // Check exact public paths
        for (String publicPath : PUBLIC_PATHS) {
            if (path.startsWith(publicPath) || path.equals(publicPath)) {
                return true;
            }
        }

        // Allow GET requests to rooms except protected endpoints
        if (path.startsWith("/api/rooms") && "GET".equalsIgnoreCase(method)) {
            for (String protectedPath : PROTECTED_ROOM_GET_PATHS) {
                if (path.startsWith(protectedPath)) {
                    return false; // requires auth
                }
            }
            return true;
        }

        return false;
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange, String message) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
        
        String body = String.format("{\"error\":\"UNAUTHORIZED\",\"message\":\"%s\",\"timestamp\":\"%s\"}",
                message, java.time.Instant.now().toString());
        
        return exchange.getResponse()
                .writeWith(Mono.just(exchange.getResponse()
                        .bufferFactory()
                        .wrap(body.getBytes(StandardCharsets.UTF_8))));
    }

    @Override
    public int getOrder() {
        return -1;
    }
}