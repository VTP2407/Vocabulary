package com.vtp.vocabulary._product.repository;

import com.vtp.vocabulary.Entity.SavedWord;
import com.vtp.vocabulary.Entity.SavedWordSet;
import com.vtp.vocabulary.dto.response.SavedWordSetResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedWordSetRepository extends JpaRepository<SavedWordSet,Long> {
    boolean existsByUserIdAndSourceWordSetId(
            Long userId,
            Long sourceWordSetId
    );

    Optional<SavedWordSet> findBySourceWordSetIdAndUserId(
            Long sourceWordSetId,
            Long userId
    );

    Optional<SavedWordSet> findByIdAndUserId(
            Long savedWordSetId,
            Long userId
    );

    @Query(
            value = """
            SELECT new com.vtp.vocabulary.dto.response.SavedWordSetResponse(
                sws.sourceWordSetId,
                sws.id,
                sws.createdBy,
                sws.setName,
                sws.description,
                COUNT(sw.id)
            )
            FROM SavedWordSet sws
            LEFT JOIN sws.savedWords sw
            WHERE sws.userId = :userId
            GROUP BY
                sws.sourceWordSetId,
                sws.id,
                sws.createdBy,
                sws.setName,
                sws.description
            ORDER BY sws.id ASC
            """,
            countQuery = """
            SELECT COUNT(sws)
            FROM SavedWordSet sws
            WHERE sws.userId = :userId
            """
    )
    Page<SavedWordSetResponse> findSavedWordSets(
            @Param("userId") Long userId,
            Pageable pageable
    );

    @Query(
            value = """
            SELECT new com.vtp.vocabulary.dto.response.SavedWordSetResponse(
                sws.sourceWordSetId,
                sws.id,
                sws.createdBy,
                sws.setName,
                sws.description,
                COUNT(sw.id)
            )
            FROM SavedWordSet sws
            LEFT JOIN sws.savedWords sw
            WHERE sws.userId = :userId
              AND (LOWER(sws.setName) LIKE LOWER(CONCAT('%', :query, '%')) 
                   OR LOWER(sws.description) LIKE LOWER(CONCAT('%', :query, '%')))
            GROUP BY
                sws.sourceWordSetId,
                sws.id,
                sws.createdBy,
                sws.setName,
                sws.description
            ORDER BY sws.id ASC
            """,
            countQuery = """
            SELECT COUNT(sws)
            FROM SavedWordSet sws
            WHERE sws.userId = :userId
              AND (LOWER(sws.setName) LIKE LOWER(CONCAT('%', :query, '%')) 
                   OR LOWER(sws.description) LIKE LOWER(CONCAT('%', :query, '%')))
            """
    )
    Page<SavedWordSetResponse> searchSavedWordSets(
            @Param("userId") Long userId,
            @Param("query") String query,
            Pageable pageable
    );

    @Query(
            value = """
            SELECT new com.vtp.vocabulary.dto.response.SavedWordSetResponse(
                sws.sourceWordSetId,
                sws.id,
                sws.createdBy,
                sws.setName,
                sws.description,
                COUNT(sw.id)
            )
            FROM SavedWordSet sws
            LEFT JOIN sws.savedWords sw
            WHERE sws.userId = :userId
            GROUP BY
                sws.sourceWordSetId,
                sws.id,
                sws.createdBy,
                sws.setName,
                sws.description
            ORDER BY sws.id ASC
            """
    )
    List<SavedWordSetResponse> findAllSavedWordSets(@Param("userId") Long userId);
}
