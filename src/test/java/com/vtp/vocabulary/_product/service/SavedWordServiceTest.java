package com.vtp.vocabulary._product.service;

import com.vtp.vocabulary.Entity.SavedWord;
import com.vtp.vocabulary.Entity.SavedWordSet;
import com.vtp.vocabulary._product.repository.SavedWordRepository;
import com.vtp.vocabulary.auth.entity.CustomUserPrincipal;
import com.vtp.vocabulary.dto.request.ExerciseRequest;
import com.vtp.vocabulary.dto.request.WordUpdateRequest;
import com.vtp.vocabulary.dto.response.ExerciseResponse;
import com.vtp.vocabulary.enumeration.Role;
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
class SavedWordServiceTest {

    @Mock
    private SavedWordRepository savedWordRepository;

    @InjectMocks
    private SavedWordService savedWordService;

    private final Long currentUserId = 66L;

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
    void testUpdateExpAfterExercise_Success_WhenOwner() {
        SavedWordSet set = SavedWordSet.builder().userId(currentUserId).build();
        SavedWord word = SavedWord.builder()
                .savedWordSet(set)
                .name("Cat")
                .definition("Con meo")
                .exp(10L)
                .build();
        word.setId(1L);

        when(savedWordRepository.findById(1L)).thenReturn(Optional.of(word));
        when(savedWordRepository.save(any(SavedWord.class))).thenAnswer(inv -> inv.getArgument(0));

        ExerciseRequest request = ExerciseRequest.builder()
                .wordUpdateRequests(List.of(
                        WordUpdateRequest.builder().savedWordId(1L).expAdded(5L).build()
                ))
                .build();

        ExerciseResponse response = savedWordService.updateExpAfterExercise(request);

        assertNotNull(response);
        assertEquals(1, response.getWordUpdateResponses().size());
        assertEquals(15L, response.getWordUpdateResponses().get(0).getNewExp());
        verify(savedWordRepository, times(1)).save(word);
    }

    @Test
    void testUpdateExpAfterExercise_ThrowsAccessDenied_WhenNotOwner() {
        SavedWordSet set = SavedWordSet.builder().userId(999L).build(); // Different user
        SavedWord word = SavedWord.builder()
                .savedWordSet(set)
                .name("Dog")
                .definition("Con cho")
                .exp(10L)
                .build();
        word.setId(2L);

        when(savedWordRepository.findById(2L)).thenReturn(Optional.of(word));

        ExerciseRequest request = ExerciseRequest.builder()
                .wordUpdateRequests(List.of(
                        WordUpdateRequest.builder().savedWordId(2L).expAdded(5L).build()
                ))
                .build();

        BusinessException ex = assertThrows(BusinessException.class, () ->
                savedWordService.updateExpAfterExercise(request)
        );

        assertEquals(ErrorCode.ACCESS_DENIED, ex.getErrorCode());
        verify(savedWordRepository, never()).save(any());
    }

    @Test
    void testUpdateExpAfterExercise_ThrowsNotFound_WhenWordDoesNotExist() {
        when(savedWordRepository.findById(3L)).thenReturn(Optional.empty());

        ExerciseRequest request = ExerciseRequest.builder()
                .wordUpdateRequests(List.of(
                        WordUpdateRequest.builder().savedWordId(3L).expAdded(5L).build()
                ))
                .build();

        BusinessException ex = assertThrows(BusinessException.class, () ->
                savedWordService.updateExpAfterExercise(request)
        );

        assertEquals(ErrorCode.WORD_NOT_FOUND, ex.getErrorCode());
    }
}

