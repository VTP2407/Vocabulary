package com.vtp.vocabulary.auth.service;

import com.vtp.vocabulary.enumeration.Role;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private final String testSecret = "my-very-secret-test-key-at-least-256-bits-long-for-hmac-sha!";

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secret", testSecret);
        ReflectionTestUtils.setField(jwtService, "accessTokenExpiration", 3600000L);
        ReflectionTestUtils.setField(jwtService, "refreshTokenExpiration", 7200000L);
    }

    @Test
    void testGenerateTokenAndExtractClaims() {
        String token = jwtService.generateToken("user@example.com", 123L, "USER");

        assertNotNull(token);
        assertEquals("user@example.com", jwtService.extractEmail(token));
        assertEquals(123L, jwtService.extractUserId(token));
        assertEquals(Role.USER, jwtService.extractRole(token));
        assertNotNull(jwtService.extractExpiration(token));
        assertTrue(jwtService.isTokenValid(token));
    }

    @Test
    void testIsTokenValid_InvalidToken_ReturnsFalse() {
        assertFalse(jwtService.isTokenValid("invalid.token.string"));
    }

    @Test
    void testIsTokenValid_TamperedToken_ReturnsFalse() {
        String token = jwtService.generateToken("user@example.com", 123L, "USER");
        String tamperedToken = token + "corrupted";
        assertFalse(jwtService.isTokenValid(tamperedToken));
    }

    @Test
    void testGenerateToken_WithAdminRole() {
        String token = jwtService.generateToken("admin@example.com", 999L, "ADMIN");
        assertEquals(Role.ADMIN, jwtService.extractRole(token));
    }
}

