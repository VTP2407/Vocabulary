package com.vtp.vocabulary._product.repository;

import com.vtp.vocabulary.Entity.UserInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserInfoRepository extends JpaRepository<UserInfo,Long> {
    Optional<UserInfo> findByUserId(Long userId);

    @Query("""
            SELECT fullName
            FROM UserInfo u
            WHERE u.id =:id
            """)
    String getFullNameById(Long id);
}
