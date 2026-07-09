package com.vtp.vocabulary.dto.request;

import com.vtp.vocabulary.Entity.Word;
import com.vtp.vocabulary.enumeration.Visibility;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateSetWordRequest {
    private String setName;

    private String description;

    private Long userId;

    private Visibility visibility;

    private List<Word> words;
}
