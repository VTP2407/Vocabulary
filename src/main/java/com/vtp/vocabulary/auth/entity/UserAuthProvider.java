package com.vtp.vocabulary.auth.entity;

import com.vtp.vocabulary.enumeration.ProviderType;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "user_auth_providers",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"provider", "provider_id"})
        }
)
public class UserAuthProvider {
    @Id
    @Column(name = "ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "USER_ID")
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "PROVIDER",nullable = false)
    private ProviderType provider;

    @Column(name = "PROVIDER_ID")
    private String providerId;
}
