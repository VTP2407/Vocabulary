package com.vtp.vocabulary._product.service;

import com.vtp.vocabulary.Entity.UserInfo;
import com.vtp.vocabulary._product.repository.UserInfoRepository;
import com.vtp.vocabulary.auth.repository.UserRepository;
import com.vtp.vocabulary.dto.response.MyUserInfoResponse;
import com.vtp.vocabulary.exception.BusinessException;
import com.vtp.vocabulary.exception.ErrorCode;
import com.vtp.vocabulary.auth.config.CurrentUserUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserInfoService {
    private final UserInfoRepository userInfoRepository;
    private final UserRepository userRepository;

    public MyUserInfoResponse getMyInfo(){
        UserInfo userInfo = userInfoRepository.findByUserId(CurrentUserUtils.getUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_EXIST));
        return MyUserInfoResponse.builder()
                .username(userRepository.findUsernameById(CurrentUserUtils.getUserId())
                        .orElseThrow(()-> new BusinessException(ErrorCode.USER_NOT_EXIST)))
                .email(CurrentUserUtils.getEmail())
                .fullName(userInfo.getFullName())
                .build();
    }
}
