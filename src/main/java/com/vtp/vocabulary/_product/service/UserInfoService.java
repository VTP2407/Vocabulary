package com.vtp.vocabulary._product.service;

import com.vtp.vocabulary.Entity.File;
import com.vtp.vocabulary.Entity.UserInfo;
import com.vtp.vocabulary._product.repository.FileRepository;
import com.vtp.vocabulary._product.repository.UserInfoRepository;
import com.vtp.vocabulary.auth.entity.User;
import com.vtp.vocabulary.auth.repository.UserRepository;
import com.vtp.vocabulary.dto.request.ChangePasswordRequest;
import com.vtp.vocabulary.dto.request.UpdateInfoRequest;
import com.vtp.vocabulary.dto.response.MyUserInfoResponse;
import com.vtp.vocabulary.dto.response.UpdateImageResponse;
import com.vtp.vocabulary.dto.response.UpdateInfoResponse;
import com.vtp.vocabulary.exception.BusinessException;
import com.vtp.vocabulary.exception.ErrorCode;
import com.vtp.vocabulary.auth.config.CurrentUserUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class UserInfoService {
    private final UserInfoRepository userInfoRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CloudinaryService cloudinaryService;
    private final FileRepository fileRepository;

    public MyUserInfoResponse getMyInfo(){
        Long userId = CurrentUserUtils.getUserId();

        if (userId == null) {
            throw new RuntimeException("userId null rồi");
        }

        UserInfo userInfo = userInfoRepository.findByUserId(CurrentUserUtils.getUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_EXIST));
        String imageUrl = null;

        if (userInfo.getImageId() != null) {
            imageUrl = fileRepository.findById(userInfo.getImageId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.FILE_NOT_EXIST))
                    .getUrl();
        }

        return MyUserInfoResponse.builder()
                .username(userRepository.findUsernameById(CurrentUserUtils.getUserId())
                        .orElseThrow(()-> new BusinessException(ErrorCode.USER_NOT_EXIST)))
                .email(CurrentUserUtils.getEmail())
                .fullName(userInfo.getFullName())
                .imageUrl(imageUrl)
                .build();
    }

    public String changePassword(ChangePasswordRequest request){
        User user = userRepository.findById(Objects.requireNonNull(CurrentUserUtils.getUserId()))
                .orElseThrow(()-> new BusinessException(ErrorCode.USER_NOT_EXIST));

        if(!request.getNewPassword().equals(request.getReNewPassword())){
            throw new BusinessException(ErrorCode.MUST_SAME_2_PASSWORD);
        }

        if(user.getPassword()==null){
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }else{
            if(passwordEncoder.matches(request.getOldPassword(), user.getPassword())){
                user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            }else{
                throw new BusinessException(ErrorCode.INVALID_PASSWORD);
            }
        }
        userRepository.save(user);
        return "đổi thành công";
    }

    public UpdateInfoResponse updateInfo(UpdateInfoRequest request){
        UserInfo userInfo = userInfoRepository.findByUserId(CurrentUserUtils.getUserId())
                .orElseThrow(()->new BusinessException(ErrorCode.USER_NOT_EXIST));
        if(!request.getFullName().isEmpty()){
            userInfo.setFullName(request.getFullName());
        }

        userInfoRepository.save(userInfo);
        return UpdateInfoResponse.builder()
                .fullName(userInfo.getFullName())
                .build();
    }

    @Transactional
    public UpdateImageResponse updateImage(MultipartFile file){
        UserInfo userInfo = userInfoRepository.findByUserId(CurrentUserUtils.getUserId())
                .orElseThrow(()-> new BusinessException(ErrorCode.USER_NOT_EXIST));
        File oldFile = null;

        if (userInfo.getImageId() != null) {
            oldFile = fileRepository.findById(userInfo.getImageId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.FILE_NOT_EXIST));
        }

        File newFile = cloudinaryService.uploadFile(file);
        userInfo.setImageId(newFile.getId());

        if (oldFile != null) {
            File finalOldFile = oldFile;

            fileRepository.delete(finalOldFile);

            TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronization() {
                        @Override
                        public void afterCommit() {
                            cloudinaryService.deleteFileOnCloudinary(finalOldFile.getPublicId());
                        }
                    }
            );
        }
        return UpdateImageResponse.builder()
                .url(newFile.getUrl())
                .build();
    }
}
