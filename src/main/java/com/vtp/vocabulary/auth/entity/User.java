package com.vtp.vocabulary.auth.entity;

import com.vtp.vocabulary.Entity.EntityBase;
import com.vtp.vocabulary.enumeration.Role;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity(name = "USERS")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class User extends EntityBase{
    @Column(name = "USERNAME",nullable = false,unique = true)
    private String username;

    @Column(name = "PASSWORD",nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "ROLE")
    private Role role;
}
