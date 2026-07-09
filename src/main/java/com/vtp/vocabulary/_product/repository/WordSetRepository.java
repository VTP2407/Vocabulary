package com.vtp.vocabulary._product.repository;

import com.vtp.vocabulary.Entity.WordSet;
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
public interface WordSetRepository extends JpaRepository<WordSet,Long> {
    Page<WordSet> findByUserId(Long userId, Pageable pageable);

    Page<WordSet> findByVisibility(Visibility visibility, Pageable pageable);
}
