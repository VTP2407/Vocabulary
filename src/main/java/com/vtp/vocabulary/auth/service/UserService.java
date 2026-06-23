package com.vtp.vocabulary.auth.service;

import com.vtp.vocabulary.auth.entity.User;
import com.vtp.vocabulary.dto.request.RegisterRequest;

import java.util.List;

public interface UserService {
    User register(RegisterRequest request);
    List<User> getAll();
}
