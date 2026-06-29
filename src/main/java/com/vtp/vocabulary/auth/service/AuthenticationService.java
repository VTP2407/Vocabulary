package com.vtp.vocabulary.auth.service;

import com.vtp.vocabulary.Entity.UserInfo;
import com.vtp.vocabulary._product.repository.UserInfoRepository;
import com.vtp.vocabulary.auth.DTO.request.LoginRequest;
import com.vtp.vocabulary.auth.DTO.request.RegisterRequest;
import com.vtp.vocabulary.auth.DTO.response.LoginResponse;
import com.vtp.vocabulary.auth.entity.User;
import com.vtp.vocabulary.auth.repository.UserRepository;
import com.vtp.vocabulary.enumeration.Role;
import com.vtp.vocabulary.exception.BusinessException;
import com.vtp.vocabulary.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserInfoRepository userInfoRepository;

    public LoginResponse login(LoginRequest request){
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(()-> new BusinessException(ErrorCode.USERNAME_OR_PASSWORD_INCORRECT));
        boolean passwordMatches = passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        );

        if(!passwordMatches){
            throw new BusinessException(ErrorCode.USERNAME_OR_PASSWORD_INCORRECT);
        }

        String token = jwtService.generateToken(
                user.getId(),
                user.getUsername(),
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

        userRepository.save(
                User.builder()
                        .username(request.getUsername())
                        .password(passwordEncoder.encode(request.getPassword()))
                        .role(Role.USER)
                        .build()
        );

        userInfoRepository.save(
                UserInfo.builder()
                        .username(request.getUsername())
                        .email(request.getEmail())
                        .build()
        );
    }

}
