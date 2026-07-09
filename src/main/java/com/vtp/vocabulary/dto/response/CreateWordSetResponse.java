package com.vtp.vocabulary.dto.response;

import com.vtp.vocabulary.Entity.Word;
import com.vtp.vocabulary.enumeration.Visibility;
import lombok.*;
import org.checkerframework.checker.units.qual.A;

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

    private List<Word> words;
}
