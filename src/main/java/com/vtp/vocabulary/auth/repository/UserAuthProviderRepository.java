package com.vtp.vocabulary.auth.repository;

import com.vtp.vocabulary.auth.entity.UserAuthProvider;
import com.vtp.vocabulary.enumeration.ProviderType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserAuthProviderRepository extends JpaRepository<UserAuthProvider,Long> {
    Optional<UserAuthProvider> findByProviderAndProviderId(
            ProviderType provider,
            String providerId
    );

    boolean existsByProviderAndProviderId(
            ProviderType provider,
            String providerId
    );
}
