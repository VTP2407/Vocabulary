package com.vtp.vocabulary.auth.service.implement;

import com.vtp.vocabulary.auth.entity.User;
import com.vtp.vocabulary.auth.repository.UserRepository;
import com.vtp.vocabulary.auth.service.UserService;
import com.vtp.vocabulary.dto.request.RegisterRequest;
import com.vtp.vocabulary.enumeration.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImplement implements UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User register(RegisterRequest request) {
        return userRepository.save(
                User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build()
        );
    }

    @Override
    public List<User> getAll() {
        return userRepository.findAll();
    }
}
