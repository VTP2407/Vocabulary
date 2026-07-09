package com.vtp.vocabulary._product.service;

import com.vtp.vocabulary.Entity.SaveWordSet;
import com.vtp.vocabulary._product.repository.SaveWordSetRepository;
import com.vtp.vocabulary.auth.config.CurrentUserUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SaveWordSetService {
    private final SaveWordSetRepository saveWordSetRepository;

    public String saveWordSet(Long wordSetId){
        saveWordSetRepository.save(SaveWordSet.builder()
                        .userId(CurrentUserUtils.getUserId())
                        .wordSetId(wordSetId)
                .build());

        return "Save word set success";
    }

    @Transactional
    public String unsaveWordSet(Long wordSetId){
        saveWordSetRepository.deleteByWordSetIdAndUserId(wordSetId,CurrentUserUtils.getUserId());
        return "Unsave word set success";
    }
}
