package com.vtp.vocabulary.dto.request;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WordUpdateRequest {
    private Long savedWordId;

    private Long expAdded;
}
