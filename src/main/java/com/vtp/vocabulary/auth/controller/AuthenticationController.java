package com.vtp.vocabulary.auth.controller;

import com.vtp.vocabulary.auth.DTO.request.LoginRequest;
import com.vtp.vocabulary.auth.DTO.request.RegisterRequest;
import com.vtp.vocabulary.auth.DTO.response.LoginResponse;
import com.vtp.vocabulary.auth.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/auth/")
@RequiredArgsConstructor
public class AuthenticationController {
    private final AuthenticationService authenticationService;

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
}
