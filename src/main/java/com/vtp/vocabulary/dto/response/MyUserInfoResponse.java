package com.vtp.vocabulary.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyUserInfoResponse {
    private String username;

    private String fullName;

    private String email;

    private String imageUrl;
}
