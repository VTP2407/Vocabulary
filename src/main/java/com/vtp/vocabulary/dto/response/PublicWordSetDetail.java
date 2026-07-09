package com.vtp.vocabulary.dto.response;

import com.vtp.vocabulary.Entity.Word;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicWordSetDetail {
    private String setName;

    private String createBy;

    private List<Word> words;
}
