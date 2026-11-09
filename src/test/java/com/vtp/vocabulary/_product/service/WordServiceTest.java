package com.vtp.vocabulary._product.service;

import com.vtp.vocabulary.Entity.Word;
import com.vtp.vocabulary.Entity.WordSet;
import com.vtp.vocabulary._product.repository.WordRepository;
import com.vtp.vocabulary._product.repository.WordSetRepository;
import com.vtp.vocabulary.auth.entity.CustomUserPrincipal;
import com.vtp.vocabulary.dto.request.CreateSetWordRequest;
import com.vtp.vocabulary.dto.response.CreateWordSetResponse;
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

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WordServiceTest {

    @Mock
    private WordRepository wordRepository;

    @Mock
    private WordSetRepository wordSetRepository;

    @InjectMocks
    private WordService wordService;

    private final Long currentUserId = 100L;

    @BeforeEach
    void setUp() {
        CustomUserPrincipal principal = new CustomUserPrincipal("test@example.com", currentUserId, Role.USER);
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
    void testCreateWordSet_Success() {
        CreateSetWordRequest request = new CreateSetWordRequest();
        request.setSetName("English Vocab 1");
        request.setDescription("Daily words");
        request.setVisibility(Visibility.PUBLIC);

        Word word = Word.builder().name("Apple").definition("Trai tao").example("An apple").build();
        request.setWords(List.of(word));

        when(wordSetRepository.save(any(WordSet.class))).thenAnswer(invocation -> {
            WordSet saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });

        CreateWordSetResponse response = wordService.createWordSet(request);

        assertNotNull(response);
        assertEquals("English Vocab 1", response.getSetName());
        assertEquals(Visibility.PUBLIC, response.getVisibility());
        verify(wordSetRepository, times(1)).save(any(WordSet.class));
    }

    @Test
    void testUpdateWordSet_Success_WhenOwner() {
        WordSet existing = WordSet.builder()
                .setName("Old Set")
                .description("Old Desc")
                .userId(currentUserId)
                .visibility(Visibility.PUBLIC)
                .words(new ArrayList<>())
                .build();
        existing.setId(1L);

        when(wordSetRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(wordSetRepository.save(any(WordSet.class))).thenAnswer(inv -> inv.getArgument(0));

        CreateSetWordRequest updateReq = new CreateSetWordRequest();
        updateReq.setSetName("Updated Set");
        updateReq.setDescription("Updated Desc");
        updateReq.setVisibility(Visibility.PRIVATE);
        Word word = Word.builder().name("Book").definition("Sach").example("Read a book").build();
        updateReq.setWords(List.of(word));

        CreateWordSetResponse response = wordService.updateWordSet(1L, updateReq);

        assertNotNull(response);
        assertEquals("Updated Set", response.getSetName());
        assertEquals(Visibility.PRIVATE, response.getVisibility());
    }

    @Test
    void testUpdateWordSet_ThrowsAccessDenied_WhenNotOwner() {
        WordSet existing = WordSet.builder()
                .setName("Other's Set")
                .description("Other's Desc")
                .userId(999L) // Different owner!
                .visibility(Visibility.PUBLIC)
                .words(new ArrayList<>())
                .build();
        existing.setId(2L);

        when(wordSetRepository.findById(2L)).thenReturn(Optional.of(existing));

        CreateSetWordRequest updateReq = new CreateSetWordRequest();
        updateReq.setSetName("Hacked Set");
        updateReq.setWords(List.of());

        BusinessException ex = assertThrows(BusinessException.class, () ->
                wordService.updateWordSet(2L, updateReq)
        );

        assertEquals(ErrorCode.ACCESS_DENIED, ex.getErrorCode());
        verify(wordSetRepository, never()).save(any());
    }

    @Test
    void testUpdateWordSet_ThrowsNotFound_WhenSetDoesNotExist() {
        when(wordSetRepository.findById(999L)).thenReturn(Optional.empty());

        CreateSetWordRequest req = new CreateSetWordRequest();
        req.setWords(List.of());

        BusinessException ex = assertThrows(BusinessException.class, () ->
                wordService.updateWordSet(999L, req)
        );

        assertEquals(ErrorCode.WORD_SET_NOT_FOUND, ex.getErrorCode());
    }
}

