package com.vtp.vocabulary.auth.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.vtp.vocabulary.Entity.UserInfo;
import com.vtp.vocabulary._product.repository.UserInfoRepository;
import com.vtp.vocabulary.auth.DTO.response.LoginResponse;
import com.vtp.vocabulary.auth.entity.User;
import com.vtp.vocabulary.auth.repository.UserRepository;
import com.vtp.vocabulary.enumeration.ProviderType;
import com.vtp.vocabulary.exception.BusinessException;
import com.vtp.vocabulary.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class GoogleAuthService {
    private final AuthenticationService authenticationService;
    private final JwtService jwtService;
    private final UserInfoRepository userInfoRepository;
    private final UserRepository userRepository;

    @Value("${google.client-id}")
    private String googleClientId;

    public LoginResponse loginWithGoogle(String idToken){
        GoogleIdToken.Payload payload = verifyGoogleToken(idToken);

        String providerId = payload.getSubject();
        String email = payload.getEmail();

        User user = authenticationService.findOrCreateSocialUser(
                ProviderType.GOOGLE,
                providerId,
                email,
                (String) payload.get("name")
        );

        String token = jwtService.generateToken(
                user.getEmail(),
                user.getId(),
                user.getRole().name()
        );

        return new LoginResponse(token, "Bearer");
    }

    private GoogleIdToken.Payload verifyGoogleToken(String idToken){
        try{
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance()
            )
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();
            GoogleIdToken googleIdToken = verifier.verify(idToken);

            if (googleIdToken == null) {
                throw new BusinessException(ErrorCode.INVALID_GOOGLE_TOKEN);
            }

            GoogleIdToken.Payload payload = googleIdToken.getPayload();

            if (payload.getEmail() == null || payload.getEmail().isBlank()) {
                throw new BusinessException(ErrorCode.EMAIL_NOT_FOUND);
            }

            return payload;
        }catch (Exception e) {
            throw new BusinessException(ErrorCode.INVALID_GOOGLE_TOKEN);
        }
    }
}
