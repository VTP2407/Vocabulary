package com.vtp.vocabulary.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

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

    @Column(name = "WORD_SET_ID")
    private Long wordSetId;
}
