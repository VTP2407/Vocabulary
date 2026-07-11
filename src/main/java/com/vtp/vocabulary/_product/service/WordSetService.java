package com.vtp.vocabulary._product.service;

import com.vtp.vocabulary.Entity.SavedWordSet;
import com.vtp.vocabulary.Entity.Word;
import com.vtp.vocabulary.Entity.WordSet;
import com.vtp.vocabulary._product.repository.SavedWordSetRepository;
import com.vtp.vocabulary._product.repository.UserInfoRepository;
import com.vtp.vocabulary._product.repository.WordRepository;
import com.vtp.vocabulary._product.repository.WordSetRepository;
import com.vtp.vocabulary.auth.config.CurrentUserUtils;
import com.vtp.vocabulary.dto.response.MyWordSetResponse;
import com.vtp.vocabulary.dto.response.PublicWordSetDetail;
import com.vtp.vocabulary.dto.response.SavedWordSetResponse;
import com.vtp.vocabulary.dto.response.WordSetResponse;
import com.vtp.vocabulary.enumeration.Visibility;
import com.vtp.vocabulary.exception.BusinessException;
import com.vtp.vocabulary.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WordSetService {
    private final WordSetRepository wordSetRepository;
    private final WordRepository wordRepository;
    private final SavedWordSetRepository savedWordSetRepository;
    private final UserInfoRepository userInfoRepository;

    public Page<MyWordSetResponse> getMyWordSet(int page, int size){
        Pageable pageable = PageRequest.of(page, size);

        return wordSetRepository.findMyWordSets(
                CurrentUserUtils.getUserId(),
                pageable
        );
    }
    @Transactional(readOnly = true)
    public Page<WordSetResponse> getPublicWordSet(int page, int size){
        Pageable pageable = PageRequest.of(page, size);

        return wordSetRepository.findWordSetsByVisibility(
                Visibility.PUBLIC,
                pageable
        );
    }

    @Transactional(readOnly = true)
    public Page<SavedWordSetResponse> getSavedWordSet(int page, int size){
        Pageable pageable = PageRequest.of(page, size);

        return savedWordSetRepository.findSavedWordSets(
                CurrentUserUtils.getUserId(),
                pageable
        );
    }

    public PublicWordSetDetail getPublicWordSetDetail(Long wordSetId){
        List<Word> words = wordRepository.findAllByWordSetId(wordSetId);

        WordSet wordSet = wordSetRepository.findById(wordSetId)
                .orElseThrow(()->new BusinessException(ErrorCode.WORD_SET_NOT_FOUND));

        return PublicWordSetDetail.builder()
                .createBy(userInfoRepository.getFullNameByUserId(wordSet.getUserId()))
                .setName(wordSet.getSetName())
                .words(words)
                .build();
    }

    @Transactional
    public void deleteWordSet(Long wordSetId) {
        WordSet wordSet = wordSetRepository.findById(wordSetId)
                .orElseThrow(() -> new BusinessException(ErrorCode.WORD_SET_NOT_FOUND));

        if (!wordSet.getUserId().equals(CurrentUserUtils.getUserId())) {
            throw new RuntimeException("Bạn không có quyền xóa bộ từ vựng này!");
        }

        wordSetRepository.delete(wordSet);
    }
}
