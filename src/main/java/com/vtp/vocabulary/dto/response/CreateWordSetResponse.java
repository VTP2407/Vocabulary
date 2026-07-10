package com.vtp.vocabulary.dto.response;

import com.vtp.vocabulary.enumeration.Visibility;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateWordSetResponse {
    private Long id;

    private String setName;

    private String description;

    private Visibility visibility;

    private List<WordResponse> wordSetResponses;
}
