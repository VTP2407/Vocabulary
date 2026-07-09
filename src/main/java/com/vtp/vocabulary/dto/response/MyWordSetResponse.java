package com.vtp.vocabulary.dto.response;

import com.vtp.vocabulary.enumeration.Visibility;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyWordSetResponse {
    private Long id;

    private String wordSetName;

    private String description;

    private Visibility visibility;

    private Long wordCount;
}
