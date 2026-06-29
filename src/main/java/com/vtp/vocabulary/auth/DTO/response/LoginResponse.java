package com.vtp.vocabulary.auth.DTO.response;

import lombok.*;

import javax.management.relation.Role;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    public String token;

    public String tokenType;
}
