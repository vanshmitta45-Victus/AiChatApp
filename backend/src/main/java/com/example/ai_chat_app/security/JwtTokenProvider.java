package com.example.ai_chat_app.security;

import com.example.ai_chat_app.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtTokenProvider {

    private static final String DEFAULT_SECRET = "ai_chat_app_super_secret_jwt_key_2026_spring_boot_slack_jira_workspace_secure!";
    private final SecretKey secretKey;
    private final long expirationMs = 86400000L; // 24 hours

    public JwtTokenProvider(@Value("${jwt.secret:}") String configuredSecret) {
        String secret = (configuredSecret != null && configuredSecret.length() >= 32)
                ? configuredSecret
                : DEFAULT_SECRET;
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("username", user.getUsername());
        claims.put("email", user.getEmail());
        claims.put("fullName", user.getFullName());
        claims.put("role", user.getRole());
        claims.put("status", user.getStatus());
        claims.put("department", user.getDepartment() != null ? user.getDepartment() : "General");

        return Jwts.builder()
                .claims(claims)
                .subject(user.getUsername() != null ? user.getUsername() : user.getEmail())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(secretKey)
                .compact();
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractUsername(String token) {
        Claims claims = extractAllClaims(token);
        String username = claims.get("username", String.class);
        return username != null ? username : claims.getSubject();
    }

    public String extractEmail(String token) {
        Claims claims = extractAllClaims(token);
        String email = claims.get("email", String.class);
        if (email != null) return email;
        String subject = claims.getSubject();
        return (subject != null && subject.contains("@")) ? subject : null;
    }

    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }

    public Long extractUserId(String token) {
        Object id = extractAllClaims(token).get("userId");
        if (id instanceof Number number) {
            return number.longValue();
        }
        return null;
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return !claims.getExpiration().before(new Date());
        } catch (Exception e) {
            return false;
        }
    }
}
