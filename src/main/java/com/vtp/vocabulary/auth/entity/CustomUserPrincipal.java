package com.vtp.vocabulary.auth.entity;

import com.vtp.vocabulary.enumeration.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@Getter
@AllArgsConstructor
public class CustomUserPrincipal {
    private String email;
    private Long userId;
    private Role role;
}
