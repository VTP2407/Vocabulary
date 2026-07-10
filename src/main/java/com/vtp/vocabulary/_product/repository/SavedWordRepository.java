package com.vtp.vocabulary._product.repository;

import com.vtp.vocabulary.Entity.SavedWord;
import com.vtp.vocabulary.dto.response.LearningWordResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public interface SavedWordRepository extends JpaRepository<SavedWord,Long> {
    List<SavedWord> findAllBySavedWordSet_Id(Long savedWordSetId);

    @Query("""
        SELECT new com.vtp.vocabulary.dto.response.LearningWordResponse(
            sw.id,
            sw.savedWordSet.id,
            sw.exp,
            sw.name,
            sw.definition,
            sw.example
        )
        FROM SavedWord sw
        WHERE sw.savedWordSet.id = :savedWordSetId
    """)
    List<LearningWordResponse> findResponsesBySavedWordSetId(
            @Param("savedWordSetId") Long savedWordSetId
    );
}
