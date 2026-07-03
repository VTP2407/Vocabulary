package com.vtp.vocabulary.Entity;

import jakarta.persistence.Entity;
import lombok.*;

@Entity
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class File extends EntityBase{
    private String url;

    private String publicId;
}
