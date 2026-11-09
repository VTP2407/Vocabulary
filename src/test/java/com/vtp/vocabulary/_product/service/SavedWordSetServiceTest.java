package com.vtp.vocabulary._product.service;

import com.vtp.vocabulary.Entity.SavedWordSet;
import com.vtp.vocabulary.Entity.Word;
import com.vtp.vocabulary.Entity.WordSet;
import com.vtp.vocabulary._product.repository.*;
import com.vtp.vocabulary.auth.entity.CustomUserPrincipal;
import com.vtp.vocabulary.dto.response.SavedWordSetDetail;
import com.vtp.vocabulary.enumeration.Role;
import com.vtp.vocabulary.enumeration.Visibility;
import com.vtp.vocabulary.exception.BusinessException;
import com.vtp.vocabulary.exception.ErrorCode;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SavedWordSetServiceTest {

    @Mock
    private SavedWordSetRepository savedWordSetRepository;

    @Mock
    private WordRepository wordRepository;

    @Mock
    private UserInfoRepository userInfoRepository;

    @Mock
    private WordSetRepository wordSetRepository;

    @Mock
    private SavedWordRepository savedWordRepository;

    @InjectMocks
    private SavedWordSetService savedWordSetService;

    private final Long currentUserId = 77L;

    @BeforeEach
    void setUp() {
        CustomUserPrincipal principal = new CustomUserPrincipal("user@example.com", currentUserId, Role.USER);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                principal, null, List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void testSaveWordSet_Success_WhenPublic() {
        WordSet source = WordSet.builder()
                .setName("Public Deck")
                .description("Public Description")
                .userId(123L)
                .visibility(Visibility.PUBLIC)
                .build();
        source.setId(10L);

        when(wordSetRepository.findById(10L)).thenReturn(Optional.of(source));
        when(savedWordSetRepository.existsByUserIdAndSourceWordSetId(currentUserId, 10L)).thenReturn(false);
        when(userInfoRepository.getFullNameByUserId(123L)).thenReturn("Author Name");
        when(wordRepository.findAllByWordSet_Id(10L)).thenReturn(List.of(
                Word.builder().name("Word1").definition("Def1").example("Ex1").build()
        ));

        String result = savedWordSetService.saveWordSet(10L);

        assertEquals("Save word set success", result);
        verify(savedWordSetRepository, times(1)).save(any(SavedWordSet.class));
    }

    @Test
    void testSaveWordSet_ThrowsAlreadySaved_WhenAlreadySaved() {
        WordSet source = WordSet.builder()
                .setName("Deck")
                .userId(123L)
                .visibility(Visibility.PUBLIC)
                .build();
        source.setId(10L);

        when(wordSetRepository.findById(10L)).thenReturn(Optional.of(source));
        when(savedWordSetRepository.existsByUserIdAndSourceWordSetId(currentUserId, 10L)).thenReturn(true);

        BusinessException ex = assertThrows(BusinessException.class, () ->
                savedWordSetService.saveWordSet(10L)
        );

        assertEquals(ErrorCode.WORD_SET_ALREADY_SAVED, ex.getErrorCode());
        verify(savedWordSetRepository, never()).save(any());
    }

    @Test
    void testSaveWordSet_ThrowsAccessDenied_WhenPrivateAndNotOwner() {
        WordSet source = WordSet.builder()
                .setName("Private Deck")
                .userId(999L) // Not current user
                .visibility(Visibility.PRIVATE)
                .build();
        source.setId(10L);

        when(wordSetRepository.findById(10L)).thenReturn(Optional.of(source));

        BusinessException ex = assertThrows(BusinessException.class, () ->
                savedWordSetService.saveWordSet(10L)
        );

        assertEquals(ErrorCode.ACCESS_DENIED, ex.getErrorCode());
        verify(savedWordSetRepository, never()).save(any());
    }

    @Test
    void testUnsaveWordSet_Success() {
        SavedWordSet saved = SavedWordSet.builder().userId(currentUserId).build();
        when(savedWordSetRepository.findBySourceWordSetIdAndUserId(10L, currentUserId)).thenReturn(Optional.of(saved));

        String result = savedWordSetService.unsaveWordSet(10L);

        assertEquals("Unsave word set success", result);
        verify(savedWordSetRepository, times(1)).delete(saved);
    }
}

