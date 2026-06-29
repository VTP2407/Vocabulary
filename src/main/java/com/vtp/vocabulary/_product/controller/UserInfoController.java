package com.vtp.vocabulary._product.controller;

import com.vtp.vocabulary._product.service.UserInfoService;
import com.vtp.vocabulary.dto.response.MyUserInfoResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user-info")
@RequiredArgsConstructor
public class UserInfoController {
    private final UserInfoService userInfoService;

    @GetMapping("/my")
    MyUserInfoResponse getMyInfo(){
        return userInfoService.getMyInfo();
    }
}
