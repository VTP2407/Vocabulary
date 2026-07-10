package com.vtp.vocabulary.Entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "SAVED_WORD_SET")
public class SavedWordSet extends EntityBase {
    @Column(name = "USER_ID", nullable = false)
    private Long userId;

    @Column(name = "SOURCE_WORD_SET_ID")
    private Long sourceWordSetId;

    @Column(name = "SET_NAME", nullable = false)
    private String setName;

    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "CREATED_BY")
    private String createdBy;

    @Builder.Default
    @OneToMany(
            mappedBy = "savedWordSet",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @JsonIgnore
    private List<SavedWord> savedWords = new ArrayList<>();

    public void addSavedWord(SavedWord savedWord) {
        savedWords.add(savedWord);
        savedWord.setSavedWordSet(this);
    }
}