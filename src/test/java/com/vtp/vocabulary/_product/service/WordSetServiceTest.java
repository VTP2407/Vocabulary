package com.vtp.vocabulary._product.service;

import com.vtp.vocabulary.Entity.Word;
import com.vtp.vocabulary.Entity.WordSet;
import com.vtp.vocabulary._product.repository.SavedWordSetRepository;
import com.vtp.vocabulary._product.repository.UserInfoRepository;
import com.vtp.vocabulary._product.repository.WordRepository;
import com.vtp.vocabulary._product.repository.WordSetRepository;
import com.vtp.vocabulary.auth.entity.CustomUserPrincipal;
import com.vtp.vocabulary.dto.response.MyWordSetResponse;
import com.vtp.vocabulary.dto.response.PublicWordSetDetail;
import com.vtp.vocabulary.dto.response.WordSetResponse;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WordSetServiceTest {

    @Mock
    private WordSetRepository wordSetRepository;

    @Mock
    private WordRepository wordRepository;

    @Mock
    private SavedWordSetRepository savedWordSetRepository;

    @Mock
    private UserInfoRepository userInfoRepository;

    @InjectMocks
    private WordSetService wordSetService;

    private final Long currentUserId = 50L;

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
    void testGetMyWordSet_Success() {
        MyWordSetResponse item = new MyWordSetResponse(1L, "My Set", "Desc", Visibility.PUBLIC, 5L);
        Page<MyWordSetResponse> page = new PageImpl<>(List.of(item));

        when(wordSetRepository.findMyWordSets(eq(currentUserId), any())).thenReturn(page);

        Page<MyWordSetResponse> result = wordSetService.getMyWordSet(0, 10);

        assertEquals(1, result.getTotalElements());
        assertEquals("My Set", result.getContent().get(0).getWordSetName());
    }

    @Test
    void testGetPublicWordSet_Success() {
        WordSetResponse item = new WordSetResponse(1L, "Public Set", "Public Desc", Visibility.PUBLIC, 10L);
        Page<WordSetResponse> page = new PageImpl<>(List.of(item));

        when(wordSetRepository.findWordSetsByVisibility(eq(Visibility.PUBLIC), any())).thenReturn(page);

        Page<WordSetResponse> result = wordSetService.getPublicWordSet(0, 10);

        assertEquals(1, result.getTotalElements());
        assertEquals("Public Set", result.getContent().get(0).getWordSetName());
    }

    @Test
    void testDeleteWordSet_Success_WhenOwner() {
        WordSet wordSet = WordSet.builder()
                .setName("My Set")
                .userId(currentUserId)
                .build();
        wordSet.setId(10L);

        when(wordSetRepository.findById(10L)).thenReturn(Optional.of(wordSet));

        assertDoesNotThrow(() -> wordSetService.deleteWordSet(10L));
        verify(wordSetRepository, times(1)).delete(wordSet);
    }

    @Test
    void testDeleteWordSet_ThrowsAccessDenied_WhenNotOwner() {
        WordSet wordSet = WordSet.builder()
                .setName("Someone Else's Set")
                .userId(999L)
                .build();
        wordSet.setId(10L);

        when(wordSetRepository.findById(10L)).thenReturn(Optional.of(wordSet));

        BusinessException ex = assertThrows(BusinessException.class, () ->
                wordSetService.deleteWordSet(10L)
        );

        assertEquals(ErrorCode.ACCESS_DENIED, ex.getErrorCode());
        verify(wordSetRepository, never()).delete(any());
    }

    @Test
    void testGetPublicWordSetDetail_Success_WhenSetIsPublic() {
        WordSet wordSet = WordSet.builder()
                .setName("Public Deck")
                .userId(999L)
                .visibility(Visibility.PUBLIC)
                .build();
        wordSet.setId(20L);

        when(wordSetRepository.findById(20L)).thenReturn(Optional.of(wordSet));
        when(wordRepository.findAllByWordSetId(20L)).thenReturn(List.of());
        when(userInfoRepository.getFullNameByUserId(999L)).thenReturn("Deck Owner");

        PublicWordSetDetail detail = wordSetService.getPublicWordSetDetail(20L);

        assertNotNull(detail);
        assertEquals("Public Deck", detail.getSetName());
        assertEquals("Deck Owner", detail.getCreateBy());
    }

    @Test
    void testGetPublicWordSetDetail_Success_WhenSetIsPrivateAndCallerIsOwner() {
        WordSet wordSet = WordSet.builder()
                .setName("Private Deck")
                .userId(currentUserId)
                .visibility(Visibility.PRIVATE)
                .build();
        wordSet.setId(21L);

        when(wordSetRepository.findById(21L)).thenReturn(Optional.of(wordSet));
        when(wordRepository.findAllByWordSetId(21L)).thenReturn(List.of());
        when(userInfoRepository.getFullNameByUserId(currentUserId)).thenReturn("Me");

        PublicWordSetDetail detail = wordSetService.getPublicWordSetDetail(21L);

        assertNotNull(detail);
        assertEquals("Private Deck", detail.getSetName());
    }

    @Test
    void testGetPublicWordSetDetail_ThrowsAccessDenied_WhenSetIsPrivateAndCallerNotOwner() {
        WordSet wordSet = WordSet.builder()
                .setName("Secret Deck")
                .userId(999L)
                .visibility(Visibility.PRIVATE)
                .build();
        wordSet.setId(22L);

        when(wordSetRepository.findById(22L)).thenReturn(Optional.of(wordSet));

        BusinessException ex = assertThrows(BusinessException.class, () ->
                wordSetService.getPublicWordSetDetail(22L)
        );

        assertEquals(ErrorCode.ACCESS_DENIED, ex.getErrorCode());
    }
}
