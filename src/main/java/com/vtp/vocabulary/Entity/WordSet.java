package com.vtp.vocabulary.Entity;

import com.vtp.vocabulary.enumeration.Visibility;
import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "WORD_SET")
public class WordSet extends EntityBase{
    @Column(name = "SET_NAME")
    private String setName;

    @Column(name = "DESCRIPTION", columnDefinition = "TEXT")
    private String description;

    @Column(name = "USER_ID")
    private Long userId;

    @Column(name = "VISIBILITY")
    @Enumerated(EnumType.STRING)
    private Visibility visibility;

    @Builder.Default
    @OneToMany(
            mappedBy = "wordSet",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @JsonIgnore
    @OnDelete(action = OnDeleteAction.CASCADE)
    private List<Word> words = new ArrayList<>();

    public void addWord(Word word) {
        words.add(word);
        word.setWordSet(this);
    }
}
