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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.regex.Pattern;

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

    private String removeAccents(String src) {
        if (src == null) {
            return "";
        }
        String temp = Normalizer.normalize(src, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(temp).replaceAll("")
                .toLowerCase()
                .replace('đ', 'd')
                .replace('Đ', 'd');
    }

    private <T> Page<T> paginateList(List<T> list, int page, int size) {
        int start = page * size;
        if (start >= list.size()) {
            return new PageImpl<>(List.of(), PageRequest.of(page, size), list.size());
        }
        int end = Math.min(start + size, list.size());
        return new PageImpl<>(list.subList(start, end), PageRequest.of(page, size), list.size());
    }

    public Page<MyWordSetResponse> searchMyWordSets(String query, int page, int size) {
        List<MyWordSetResponse> allSets = wordSetRepository.findAllMyWordSets(CurrentUserUtils.getUserId());
        String normalizedQuery = removeAccents(query);

        List<MyWordSetResponse> filtered = allSets.stream()
                .filter(ws -> removeAccents(ws.getWordSetName()).contains(normalizedQuery) ||
                        (ws.getDescription() != null && removeAccents(ws.getDescription()).contains(normalizedQuery)))
                .toList();

        return paginateList(filtered, page, size);
    }

    @Transactional(readOnly = true)
    public Page<WordSetResponse> searchPublicWordSets(String query, int page, int size) {
        List<WordSetResponse> allSets = wordSetRepository.findAllPublicWordSets(Visibility.PUBLIC);
        String normalizedQuery = removeAccents(query);

        List<WordSetResponse> filtered = allSets.stream()
                .filter(ws -> removeAccents(ws.getWordSetName()).contains(normalizedQuery) ||
                        (ws.getDescription() != null && removeAccents(ws.getDescription()).contains(normalizedQuery)))
                .toList();

        return paginateList(filtered, page, size);
    }

    @Transactional(readOnly = true)
    public Page<SavedWordSetResponse> searchSavedWordSets(String query, int page, int size) {
        List<SavedWordSetResponse> allSets = savedWordSetRepository.findAllSavedWordSets(CurrentUserUtils.getUserId());
        String normalizedQuery = removeAccents(query);

        List<SavedWordSetResponse> filtered = allSets.stream()
                .filter(ws -> removeAccents(ws.getWordSetName()).contains(normalizedQuery) ||
                        (ws.getDescription() != null && removeAccents(ws.getDescription()).contains(normalizedQuery)))
                .toList();

        return paginateList(filtered, page, size);
    }

    public PublicWordSetDetail getPublicWordSetDetail(Long wordSetId){
        WordSet wordSet = wordSetRepository.findById(wordSetId)
                .orElseThrow(()->new BusinessException(ErrorCode.WORD_SET_NOT_FOUND));

        Long currentUserId = CurrentUserUtils.getUserId();
        if (wordSet.getVisibility() == Visibility.PRIVATE &&
                (currentUserId == null || !wordSet.getUserId().equals(currentUserId))) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        List<Word> words = wordRepository.findAllByWordSetId(wordSetId);

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

        Long currentUserId = CurrentUserUtils.getUserId();
        if (currentUserId == null || !wordSet.getUserId().equals(currentUserId)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        wordSetRepository.delete(wordSet);
    }
}
