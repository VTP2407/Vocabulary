package com.vtp.vocabulary._product.repository;

import com.vtp.vocabulary.Entity.Word;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WordRepository extends JpaRepository<Word,Long> {
    @Query("""
            SELECT COUNT(*)
            FROM Word ws
            WHERE ws.wordSetId =:id
            """)
    Long getCount(@Param("id") Long id);

    List<Word> findAllByWordSetId(Long wordSetId);
}
