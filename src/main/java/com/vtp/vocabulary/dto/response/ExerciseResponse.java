package com.vtp.vocabulary.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseResponse {
    List<WordUpdateResponse> wordUpdateResponses;
}
