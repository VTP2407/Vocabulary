package com.vtp.vocabulary._product.controller;

import com.vtp.vocabulary._product.service.UserInfoService;
import com.vtp.vocabulary.dto.request.ChangePasswordRequest;
import com.vtp.vocabulary.dto.request.UpdateInfoRequest;
import com.vtp.vocabulary.dto.response.MyUserInfoResponse;
import com.vtp.vocabulary.dto.response.UpdateImageResponse;
import com.vtp.vocabulary.dto.response.UpdateInfoResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/user-info")
@RequiredArgsConstructor
public class UserInfoController {
    private final UserInfoService userInfoService;

    @GetMapping("/my")
    MyUserInfoResponse getMyInfo(){
        return userInfoService.getMyInfo();
    }

    @PostMapping("/change-password")
    String changePassword(@RequestBody ChangePasswordRequest request){
        return userInfoService.changePassword(request);
    }

    @PutMapping("")
    UpdateInfoResponse updateInfo(@RequestBody UpdateInfoRequest request){
        return userInfoService.updateInfo(request);
    }

    @PutMapping("/avatar")
    UpdateImageResponse updateImage(@RequestParam("file") MultipartFile file){
        return userInfoService.updateImage(file);
    }
}
