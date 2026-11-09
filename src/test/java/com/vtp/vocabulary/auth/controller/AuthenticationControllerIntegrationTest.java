package com.vtp.vocabulary.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vtp.vocabulary.auth.DTO.request.LoginRequest;
import com.vtp.vocabulary.auth.DTO.request.RegisterRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthenticationControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testRegisterAndLoginFlow() throws Exception {
        RegisterRequest registerRequest = RegisterRequest.builder()
                .username("testintegrationuser")
                .password("Password123!")
                .rePassword("Password123!")
                .email("integration_test@example.com")
                .build();

        // 1. Register successfully
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk())
                .andExpect(content().string("register success"));

        // 2. Login successfully with registered username
        LoginRequest loginRequest = new LoginRequest("testintegrationuser", "Password123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.tokenType").value("Bearer"));

        // 3. Login with wrong password returns 401
        LoginRequest wrongPasswordRequest = new LoginRequest("testintegrationuser", "WrongPassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wrongPasswordRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("401"));
    }

    @Test
    void testRegisterWithMismatchedPassword_ReturnsBadRequest() throws Exception {
        RegisterRequest registerRequest = RegisterRequest.builder()
                .username("mismatch_user")
                .password("Pass1")
                .rePassword("Pass2")
                .email("mismatch@example.com")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isForbidden()) // 403 as defined in ErrorCode MUST_SAME_2_PASSWORD
                .andExpect(jsonPath("$.code").value("403"));
    }
}
