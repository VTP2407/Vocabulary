package com.vtp.vocabulary.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaveWordSet extends EntityBase{
    @Column(name = "USER_ID")
    private Long userId;

    @Column(name = "WORD_SET_ID")
    private Long wordSetId;
}
