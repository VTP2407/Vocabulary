package com.vtp.vocabulary.dto.request;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseRequest {
    List<WordUpdateRequest> wordUpdateRequests;
}
