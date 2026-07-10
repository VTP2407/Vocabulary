package com.vtp.vocabulary.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WordResponse {
    private Long id;
    private String name;
    private String definition;
    private String example;
}
