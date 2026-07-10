package com.vtp.vocabulary.Entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.ArrayList;
import java.util.List;

@Entity
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "WORD")
public class Word extends EntityBase{
    @Column(name = "NAME")
    private String name;

    @Column(name = "DEFINITION")
    private String definition;

    @Column(name = "EXAMPLE")
    private String example;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "WORD_SET_ID", nullable = false)
    @JsonIgnore
    private WordSet wordSet;
}
