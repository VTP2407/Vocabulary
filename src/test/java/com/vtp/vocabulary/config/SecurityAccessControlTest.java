package com.vtp.vocabulary.config;

import com.vtp.vocabulary.auth.service.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityAccessControlTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Test
    void testCheckLife_IsPublic_Returns200() throws Exception {
        mockMvc.perform(get("/api/check"))
                .andExpect(status().isOk());
    }

    @Test
    void testGetPublicWordSets_IsPublic_Returns200() throws Exception {
        mockMvc.perform(get("/api/word-set/public"))
                .andExpect(status().isOk());
    }

    @Test
    void testLoginEndpoint_IsPublic_DoesNotReturn401ForUnauthenticatedRequest() throws Exception {
        // Even with empty body, it should hit controller and not return 401 from security filter
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    org.junit.jupiter.api.Assertions.assertNotEquals(401, status,
                            "Login endpoint should be public and not blocked by 401 Unauthorized filter");
                });
    }

    @Test
    void testGetMyUserInfo_WithoutAuth_Returns401Unauthorized() throws Exception {
        mockMvc.perform(get("/api/user-info/my"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("401"));
    }

    @Test
    void testCreateWordSet_WithoutAuth_Returns401Unauthorized() throws Exception {
        mockMvc.perform(post("/api/word-set/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"setName\":\"Test\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("401"));
    }

    @Test
    void testGetMyWordSets_WithoutAuth_Returns401Unauthorized() throws Exception {
        mockMvc.perform(get("/api/word-set/my"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("401"));
    }

    @Test
    void testGetSavedWordSets_WithoutAuth_Returns401Unauthorized() throws Exception {
        mockMvc.perform(get("/api/word-set/saved"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("401"));
    }

    @Test
    void testProtectedEndpoint_WithValidJwtToken_PassesSecurity() throws Exception {
        String token = jwtService.generateToken("user@example.com", 1L, "USER");

        mockMvc.perform(get("/api/word-set/my")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }
}

