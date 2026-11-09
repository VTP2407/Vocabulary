package com.vtp.vocabulary._product.service;

import com.vtp.vocabulary.Entity.SavedWord;
import com.vtp.vocabulary._product.repository.SavedWordRepository;
import com.vtp.vocabulary.auth.config.CurrentUserUtils;
import com.vtp.vocabulary.dto.request.ExerciseRequest;
import com.vtp.vocabulary.dto.response.ExerciseResponse;
import com.vtp.vocabulary.dto.response.WordUpdateResponse;
import com.vtp.vocabulary.exception.BusinessException;
import com.vtp.vocabulary.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SavedWordService {
    private final SavedWordRepository savedWordRepository;

    public ExerciseResponse updateExpAfterExercise(ExerciseRequest request){
        Long currentUserId = CurrentUserUtils.getUserId();
        List<SavedWord> savedWords = request.getWordUpdateRequests().stream().map(
                r->{
                    SavedWord savedWord = savedWordRepository.findById(r.getSavedWordId())
                            .orElseThrow(()->new BusinessException(ErrorCode.WORD_NOT_FOUND));

                    if (currentUserId == null || !savedWord.getSavedWordSet().getUserId().equals(currentUserId)) {
                        throw new BusinessException(ErrorCode.ACCESS_DENIED);
                    }

                    savedWord.setExp(savedWord.getExp()+r.getExpAdded());
                    return savedWordRepository.save(savedWord);
                }
        ).toList();
        return ExerciseResponse.builder()
                .wordUpdateResponses
                        (savedWords.stream().map(
                        sw -> WordUpdateResponse.builder()
                                .newExp(sw.getExp())
                                .savedWordId(sw.getId())
                                .build()
                        ).toList())
                .build();
    }
}
