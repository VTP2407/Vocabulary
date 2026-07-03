package com.vtp.vocabulary.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "USER_INFO")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfo extends EntityBase{
    @Column(name = "userId")
    private Long userId;

    @Column(name = "FULL_NAME")
    private String fullName;

    @Column(name = "IMAGE_ID")
    private Long imageId;
}
