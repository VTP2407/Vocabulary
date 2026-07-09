package com.vtp.vocabulary._product.repository;

import com.vtp.vocabulary.Entity.SaveWordSet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SaveWordSetRepository extends JpaRepository<SaveWordSet,Long> {
    void deleteByWordSetIdAndUserId(Long wordSetId, Long userId);

    Page<SaveWordSet> findByUserId(Long userId, Pageable pageable);
}
