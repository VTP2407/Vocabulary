package com.vtp.vocabulary.auth.controller;

import com.vtp.vocabulary.auth.DTO.request.GoogleLoginRequest;
import com.vtp.vocabulary.auth.DTO.request.LoginRequest;
import com.vtp.vocabulary.auth.DTO.request.RegisterRequest;
import com.vtp.vocabulary.auth.DTO.response.LoginResponse;
import com.vtp.vocabulary.auth.service.AuthenticationService;
import com.vtp.vocabulary.auth.service.GoogleAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/auth/")
@RequiredArgsConstructor
public class AuthenticationController {
    private final AuthenticationService authenticationService;
    private final GoogleAuthService googleAuthService;

    @PostMapping("/login")
    LoginResponse login(@RequestBody LoginRequest request){
        return authenticationService.login(request);
    }

    @PostMapping("/register")
    String login(@RequestBody RegisterRequest request){
        authenticationService.register(request);
        return "register success";
    }

    @PostMapping("/logout")
    String logout(){
        return "logout success";
    }

    @PostMapping("/google")
    public ResponseEntity<LoginResponse> loginWithGoogle(
            @RequestBody GoogleLoginRequest request
    ) {
        return ResponseEntity.ok(
                googleAuthService.loginWithGoogle(request.getIdToken())
        );
    }
}
