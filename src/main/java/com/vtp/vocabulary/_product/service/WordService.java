package com.vtp.vocabulary._product.service;

import com.vtp.vocabulary.Entity.Word;
import com.vtp.vocabulary.Entity.WordSet;
import com.vtp.vocabulary._product.repository.WordRepository;
import com.vtp.vocabulary._product.repository.WordSetRepository;
import com.vtp.vocabulary.auth.config.CurrentUserUtils;
import com.vtp.vocabulary.dto.request.CreateSetWordRequest;
import com.vtp.vocabulary.dto.response.CreateWordSetResponse;
import com.vtp.vocabulary.dto.response.WordResponse;
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

        request.getWords().forEach(wordRequest->{
            Word word = Word.builder()
                    .name(wordRequest.getName())
                    .definition(wordRequest.getDefinition())
                    .example(wordRequest.getExample())
                    .build();

            wordSet.addWord(word);
        });

        WordSet savedWordSet = wordSetRepository.save(wordSet);

        List<WordResponse> wordResponses = savedWordSet.getWords().stream()
                .map(word -> WordResponse.builder()
                        .id(word.getId())
                        .name(word.getName())
                        .definition(word.getDefinition())
                        .example(word.getExample())
                        .build()
                )
                .toList();

        return CreateWordSetResponse.builder()
                .id(wordSet.getId())
                .setName(wordSet.getSetName())
                .description(wordSet.getDescription())
                .visibility(wordSet.getVisibility())
                .wordSetResponses(wordResponses)
                .build();
    }
}
