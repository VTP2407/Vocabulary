package com.vtp.vocabulary.Entity;

import com.vtp.vocabulary.enumeration.Visibility;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "VOCABULARY_SET")
public class WordSet extends EntityBase{
    @Column(name = "SET_NAME")
    private String setName;

    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "USER_ID")
    private Long userId;

    @Column(name = "VISIBILITY")
    @Enumerated(EnumType.STRING)
    private Visibility visibility;
}
