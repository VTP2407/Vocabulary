package com.vtp.vocabulary.Entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "SAVED_WORD")
public class SavedWord extends EntityBase {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "SAVED_WORD_SET_ID", nullable = false)
    @JsonIgnore
    private SavedWordSet savedWordSet;

    @Column(name = "NAME", nullable = false)
    private String name;

    @Column(name = "DEFINITION", nullable = false)
    private String definition;

    @Column(name = "EXAMPLE")
    private String example;

    @Column(name = "EXP", nullable = false)
    @Builder.Default
    private Long exp = 0L;
}
