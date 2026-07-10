package com.vtp.vocabulary._product.service;

import com.vtp.vocabulary.Entity.SavedWord;
import com.vtp.vocabulary.Entity.SavedWordSet;
import com.vtp.vocabulary.Entity.Word;
import com.vtp.vocabulary.Entity.WordSet;
import com.vtp.vocabulary._product.repository.*;
import com.vtp.vocabulary.auth.config.CurrentUserUtils;
import com.vtp.vocabulary.dto.response.LearningWordResponse;
import com.vtp.vocabulary.dto.response.SavedWordSetDetail;
import com.vtp.vocabulary.exception.BusinessException;
import com.vtp.vocabulary.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SavedWordSetService {
    private final SavedWordSetRepository savedWordSetRepository;
    private final WordRepository wordRepository;
    private final UserInfoRepository userInfoRepository;
    private final WordSetRepository wordSetRepository;
    private final SavedWordRepository savedWordRepository;

    @Transactional
    public String saveWordSet(Long wordSetId) {
        Long currentUserId = CurrentUserUtils.getUserId();

        WordSet sourceWordSet = wordSetRepository.findById(wordSetId)
                .orElseThrow(() ->
                        new BusinessException(ErrorCode.WORD_SET_NOT_FOUND)
                );

        boolean existed = savedWordSetRepository
                .existsByUserIdAndSourceWordSetId(
                        currentUserId,
                        wordSetId
                );

        if (existed) {
            throw new BusinessException(ErrorCode.WORD_SET_ALREADY_SAVED);
        }

        String createdBy = userInfoRepository
                .getFullNameByUserId(sourceWordSet.getUserId());

        SavedWordSet savedWordSet = SavedWordSet.builder()
                .userId(currentUserId)
                .sourceWordSetId(sourceWordSet.getId())
                .setName(sourceWordSet.getSetName())
                .description(sourceWordSet.getDescription())
                .createdBy(createdBy)
                .build();

        List<Word> words =
                wordRepository.findAllByWordSet_Id(wordSetId);

        words.forEach(word -> {
            SavedWord savedWord = SavedWord.builder()
                    .name(word.getName())
                    .definition(word.getDefinition())
                    .example(word.getExample())
                    .exp(0L)
                    .build();

            savedWordSet.addSavedWord(savedWord);
        });

        savedWordSetRepository.save(savedWordSet);

        return "Save word set success";
    }

    @Transactional
    public String unsaveWordSet(Long sourceWordSetId) {
        SavedWordSet savedWordSet = savedWordSetRepository
                .findBySourceWordSetIdAndUserId(
                        sourceWordSetId,
                        CurrentUserUtils.getUserId()
                )
                .orElseThrow(() ->
                        new BusinessException(ErrorCode.SAVED_WORD_SET_NOT_FOUND)
                );

        savedWordSetRepository.delete(savedWordSet);

        return "Unsave word set success";
    }

    @Transactional(readOnly = true)
    public SavedWordSetDetail getSavedWordSetDetail(Long savedWordSetId) {
        SavedWordSet savedWordSet = savedWordSetRepository
                .findByIdAndUserId(
                        savedWordSetId,
                        CurrentUserUtils.getUserId()
                )
                .orElseThrow(() ->
                        new BusinessException(ErrorCode.SAVED_WORD_SET_NOT_FOUND)
                );

        List<LearningWordResponse> list =
                savedWordRepository.findResponsesBySavedWordSetId(
                        savedWordSetId
                );

        return SavedWordSetDetail.builder()
                .createBy(savedWordSet.getCreatedBy())
                .setName(savedWordSet.getSetName())
                .learningWordResponses(list)
                .build();
    }
}
