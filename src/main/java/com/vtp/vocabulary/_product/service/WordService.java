package com.vtp.vocabulary._product.service;

import com.vtp.vocabulary.Entity.Word;
import com.vtp.vocabulary.Entity.WordSet;
import com.vtp.vocabulary._product.repository.WordRepository;
import com.vtp.vocabulary._product.repository.WordSetRepository;
import com.vtp.vocabulary.auth.config.CurrentUserUtils;
import com.vtp.vocabulary.dto.request.CreateSetWordRequest;
import com.vtp.vocabulary.dto.response.CreateWordSetResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WordService{
    private final WordRepository wordRepository;
    private final WordSetRepository wordSetRepository;

    @Transactional
    public CreateWordSetResponse createWordSet(CreateSetWordRequest request){
        WordSet wordSet = WordSet.builder()
                .setName(request.getSetName())
                .description(request.getDescription())
                .userId(CurrentUserUtils.getUserId())
                .visibility(request.getVisibility())
                .build();
        wordSetRepository.save(wordSet);

        List<Word> list = request.getWords().stream()
                .map(wordRequest -> Word.builder()
                        .name(wordRequest.getName())
                        .definition(wordRequest.getDefinition())
                        .example(wordRequest.getExample())
                        .wordSetId(wordSet.getId())
                        .build()
                )
                .toList();
        wordRepository.saveAll(list);

        return CreateWordSetResponse.builder()
                .id(wordSet.getId())
                .setName(wordSet.getSetName())
                .description(wordSet.getDescription())
                .visibility(wordSet.getVisibility())
                .words(list)
                .build();
    }
}
