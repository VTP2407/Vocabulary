package com.vtp.vocabulary.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavedWordSetDetail {
    private String setName;

    private String createBy;

    private List<LearningWordResponse> learningWordResponses;
}
