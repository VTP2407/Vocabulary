package com.vtp.vocabulary.auth.entity;

import com.vtp.vocabulary.Entity.EntityBase;
import com.vtp.vocabulary.enumeration.Role;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "USERS")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class User extends EntityBase{
    @Column(name = "USERNAME",nullable = false,unique = true)
    private String username;

    @Column(name = "PASSWORD")
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "ROLE")
    private Role role;

    @Column(name = "EMAIL",unique = true, nullable = false)
    private String email;
}
