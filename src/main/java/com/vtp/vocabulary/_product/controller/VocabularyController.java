package com.vtp.vocabulary._product.controller;

import com.vtp.vocabulary.Entity.SaveWordSet;
import com.vtp.vocabulary._product.service.SaveWordSetService;
import com.vtp.vocabulary._product.service.WordService;
import com.vtp.vocabulary._product.service.WordSetService;
import com.vtp.vocabulary.dto.request.CreateSetWordRequest;
import com.vtp.vocabulary.dto.response.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/word-set")
@RequiredArgsConstructor
public class VocabularyController {
    private final WordService wordService;
    private final WordSetService wordSetService;
    private final SaveWordSetService saveWordSetService;

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
    String saveWordSet(@RequestParam Long wordSetId){
        return saveWordSetService.saveWordSet(wordSetId);
    }

    @DeleteMapping("/{wordSetId}/unsave")
    String unsaveWordSet(@RequestParam Long wordSetId){
        return saveWordSetService.unsaveWordSet(wordSetId);
    }

    @GetMapping("/saved")
    Page<SavedWordSetResponse> savedWordSet(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ){
        return wordSetService.getSavedWordSet(page, size);
    }

    @GetMapping("/{wordSetId}")
    PublicWordSetDetail getPublicWordSetDetail(@RequestParam Long wordSetId){
        return wordSetService.getPublicWordSetDetail(wordSetId);
    }
}
