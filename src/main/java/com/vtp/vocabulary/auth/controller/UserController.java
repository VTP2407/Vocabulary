package com.vtp.vocabulary.auth.controller;

import com.vtp.vocabulary.auth.entity.User;
import com.vtp.vocabulary.auth.service.UserService;
import com.vtp.vocabulary.dto.request.RegisterRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/auth/")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    User register(@RequestBody RegisterRequest request){
        return userService.register(request);
    }

    @GetMapping("/all")
    List<User> getAll(){
        return userService.getAll();
    }
}
