package com.vtp.vocabulary.dto.response;

import jakarta.persistence.Column;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningWordResponse {
    private Long wordId;

    private Long savedWordSetId;

    private Long exp;

    private String name;

    private String definition;

    private String example;
}
