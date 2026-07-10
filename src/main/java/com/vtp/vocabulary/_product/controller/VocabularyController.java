package com.vtp.vocabulary._product.controller;

import com.vtp.vocabulary._product.service.SavedWordSetService;
import com.vtp.vocabulary._product.service.WordService;
import com.vtp.vocabulary._product.service.WordSetService;
import com.vtp.vocabulary.dto.request.CreateSetWordRequest;
import com.vtp.vocabulary.dto.response.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/word-set")
@RequiredArgsConstructor
public class VocabularyController {
    private final WordService wordService;
    private final WordSetService wordSetService;
    private final SavedWordSetService savedWordSetService;

    @PostMapping("/create")
    CreateWordSetResponse createWordSet(@RequestBody CreateSetWordRequest request){
        return wordService.createWordSet(request);
    }

    @GetMapping("/my")
    Page<MyWordSetResponse> getMyWordSet(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ){
        return wordSetService.getMyWordSet(page,size);
    }

    @GetMapping("/public")
    Page<WordSetResponse> getPublicWordSet(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ){
        return wordSetService.getPublicWordSet(page,size);
    }

    @PostMapping("/{wordSetId}/save")
    String saveWordSet(@PathVariable Long wordSetId){
        return savedWordSetService.saveWordSet(wordSetId);
    }

    @DeleteMapping("/{wordSetId}/unsave")
    String unsaveWordSet(@PathVariable Long wordSetId){
        return savedWordSetService.unsaveWordSet(wordSetId);
    }

    @GetMapping("/saved")
    Page<SavedWordSetResponse> savedWordSet(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ){
        return wordSetService.getSavedWordSet(page, size);
    }

    @GetMapping("/{wordSetId}")
    PublicWordSetDetail getPublicWordSetDetail(@PathVariable Long wordSetId){
        return wordSetService.getPublicWordSetDetail(wordSetId);
    }

    @GetMapping("/saved/{savedWordSetId}")
    SavedWordSetDetail getSavedWordSetDetail(@PathVariable Long savedWordSetId){
        return savedWordSetService.getSavedWordSetDetail(savedWordSetId);
    }
}
