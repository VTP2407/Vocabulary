package com.vtp.vocabulary.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WordUpdateResponse {
    private Long savedWordId;

    private Long newExp;
}
