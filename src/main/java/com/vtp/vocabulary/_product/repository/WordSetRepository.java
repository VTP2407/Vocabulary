package com.vtp.vocabulary._product.repository;

import com.vtp.vocabulary.Entity.WordSet;
import com.vtp.vocabulary.dto.response.MyWordSetResponse;
import com.vtp.vocabulary.dto.response.WordSetResponse;
import com.vtp.vocabulary.enumeration.Visibility;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WordSetRepository extends JpaRepository<WordSet, Long> {

    @Query(
            value = """
                    SELECT new com.vtp.vocabulary.dto.response.MyWordSetResponse(
                        ws.id,
                        ws.setName,
                        ws.description,
                        ws.visibility,
                        COUNT(w.id)
                    )
                    FROM WordSet ws
                    LEFT JOIN Word w ON w.wordSet = ws
                    WHERE ws.userId = :userId
                    GROUP BY ws.id, ws.setName, ws.description, ws.visibility
                    """,
            countQuery = """
                    SELECT COUNT(ws)
                    FROM WordSet ws
                    WHERE ws.userId = :userId
                    """
    )
    Page<MyWordSetResponse> findMyWordSets(
            @Param("userId") Long userId,
            Pageable pageable
    );

    @Query(
            value = """
                    SELECT new com.vtp.vocabulary.dto.response.WordSetResponse(
                        ws.id,
                        ws.setName,
                        ws.description,
                        ws.visibility,
                        COUNT(w.id)
                    )
                    FROM WordSet ws
                    LEFT JOIN Word w ON w.wordSet = ws
                    WHERE ws.visibility = :visibility
                    GROUP BY ws.id, ws.setName, ws.description, ws.visibility
                    """,
            countQuery = """
                    SELECT COUNT(ws)
                    FROM WordSet ws
                    WHERE ws.visibility = :visibility
                    """
    )
    Page<WordSetResponse> findWordSetsByVisibility(
            @Param("visibility") Visibility visibility,
            Pageable pageable
    );
}
