package com.vtp.vocabulary.dto.response;

import com.vtp.vocabulary.enumeration.Visibility;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavedWordSetResponse {
    private Long id;

    private Long savedWordSetId;

    private String fullName;

    private String wordSetName;

    private String description;

    private Visibility visibility;

    private Long wordCount;

    public SavedWordSetResponse(Long id, Long savedWordSetId, String fullName, String wordSetName, String description, Long wordCount) {
        this.id = id;
        this.savedWordSetId = savedWordSetId;
        this.fullName = fullName;
        this.wordSetName = wordSetName;
        this.description = description;
        this.visibility = Visibility.PUBLIC;
        this.wordCount = wordCount;
    }
}
