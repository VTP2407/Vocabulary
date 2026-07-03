package com.vtp.vocabulary.auth.service;

import com.vtp.vocabulary.Entity.UserInfo;
import com.vtp.vocabulary._product.repository.UserInfoRepository;
import com.vtp.vocabulary.auth.DTO.request.LoginRequest;
import com.vtp.vocabulary.auth.DTO.request.RegisterRequest;
import com.vtp.vocabulary.auth.DTO.response.LoginResponse;
import com.vtp.vocabulary.auth.entity.User;
import com.vtp.vocabulary.auth.entity.UserAuthProvider;
import com.vtp.vocabulary.auth.repository.UserAuthProviderRepository;
import com.vtp.vocabulary.auth.repository.UserRepository;
import com.vtp.vocabulary.enumeration.ProviderType;
import com.vtp.vocabulary.enumeration.Role;
import com.vtp.vocabulary.exception.BusinessException;
import com.vtp.vocabulary.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserInfoRepository userInfoRepository;
    private final UserAuthProviderRepository userAuthProviderRepository;

    public LoginResponse login(LoginRequest request){
        User user;
        if(!request.getUsername().contains("@")){
            user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(()-> new BusinessException(ErrorCode.USERNAME_OR_PASSWORD_INCORRECT));
        }else{
            user = userRepository.findByEmail(request.getUsername())
                    .orElseThrow(()-> new BusinessException(ErrorCode.USER_NOT_EXIST));
        }

        boolean passwordMatches = passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        );

        if(!passwordMatches){
            throw new BusinessException(ErrorCode.USERNAME_OR_PASSWORD_INCORRECT);
        }

        String token = jwtService.generateToken(
                user.getEmail(),
                user.getId(),
                user.getRole().name()
        );

        return new LoginResponse(token, "Bearer");
    }

    public void register(RegisterRequest request) {
        if(request==null ||
                !StringUtils.hasText(request.getUsername())||
                !StringUtils.hasText(request.getPassword()) ||
                !StringUtils.hasText(request.getRePassword()) ||
                !StringUtils.hasText(request.getEmail())
        ){
            throw new BusinessException(ErrorCode.MUST_FILL_ALL);
        }
        if(!request.getPassword().equals(request.getRePassword())){
            throw new BusinessException(ErrorCode.MUST_SAME_2_PASSWORD);
        }

        if(userRepository.existsByEmail(request.getEmail())){
            throw new BusinessException(ErrorCode.EMAIL_WAS_USED);
        }

        if(userRepository.existsByUsername(request.getUsername())){
            throw  new BusinessException(ErrorCode.USERNAME_EXISTED);
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .role(Role.USER)
                .build();

        userRepository.save(user);

        userAuthProviderRepository.save(
                UserAuthProvider.builder()
                        .userId(user.getId())
                        .provider(ProviderType.LOCAL)
                        .build()
        );

        userInfoRepository.save(
                UserInfo.builder()
                        .userId(user.getId())
                        .fullName(request.getUsername())
                        .build()
        );
    }

    @Transactional
    public User findOrCreateSocialUser(
            ProviderType provider,
            String providerId,
            String email,
            String fullName
        ){
        if (email == null || email.isBlank()) {
            throw new BusinessException(ErrorCode.EMAIL_NOT_FOUND);
        }

        Optional<UserAuthProvider> authProviderOptional =
                userAuthProviderRepository.findByProviderAndProviderId(provider,providerId);
        //kiểm tra tài khoản tồn tại
        if(authProviderOptional.isPresent()) {
            Long userId = authProviderOptional.get().getUserId();

            return userRepository.findById(userId).
                    orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_EXIST));
        }
        //kiểm tra email đã đăng ký bằng Local
        Optional<User> existingUserOptional = userRepository.findByEmail(email);

        if(existingUserOptional.isPresent()){
            User existingUser = existingUserOptional.get();

            UserAuthProvider authProvider = UserAuthProvider.builder()
                    .userId(existingUser.getId())
                    .provider(provider)
                    .providerId(providerId)
                    .build();

            userAuthProviderRepository.save(authProvider);
            return existingUser;
        }
        //nếu chưa có tài khoản thì tạo 1 tài khoản mới
        User newUser = User.builder()
                .username(generateUsername(email))
                .email(email)
                .password(null)
                .role(Role.USER)
                .build();
        userRepository.save(newUser);

        UserAuthProvider authProvider = UserAuthProvider.builder()
                .userId(newUser.getId())
                .providerId(providerId)
                .provider(provider)
                .build();
        userAuthProviderRepository.save(authProvider);

        UserInfo userInfo = UserInfo.builder()
                .fullName(fullName)
                .userId(newUser.getId())
                .build();
        userInfoRepository.save(userInfo);

        return newUser;
    }

    private String generateUsername(String email){
        if (email == null || email.isEmpty() || email.indexOf('@')==-1) {
            throw new RuntimeException("email lỗi");
        }

        String newUsername = email.substring(0,email.indexOf('@')).toLowerCase();
        newUsername = newUsername.replaceAll("[^a-zA-Z0-9]", "");

        int count = 1;
        while (userRepository.existsByUsername(newUsername)){
            newUsername = newUsername + count;
            count++;
        }
        return newUsername;
    }
}
