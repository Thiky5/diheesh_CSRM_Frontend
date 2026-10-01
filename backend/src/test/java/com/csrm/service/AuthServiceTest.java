package com.csrm.service;

import com.csrm.dto.RegisterRequest;
import com.csrm.entity.Role;
import com.csrm.exception.BadRequestException;
import com.csrm.repository.UserRepository;
import com.csrm.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    @Test
    void registerRejectsBlankEmail() {
        UserRepository userRepository = mock(UserRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        AuthenticationManager authenticationManager = mock(AuthenticationManager.class);
        JwtTokenProvider tokenProvider = mock(JwtTokenProvider.class);
        AuditLogService auditLogService = mock(AuditLogService.class);
        NotificationService notificationService = mock(NotificationService.class);

        AuthService authService = new AuthService(
                userRepository,
                passwordEncoder,
                authenticationManager,
                tokenProvider,
                auditLogService,
                notificationService
        );

        RegisterRequest request = new RegisterRequest(
                "hulk",
                "password123",
                "Hulk",
                "   ",
                Role.STUDENT
        );

        when(userRepository.existsByUsername("hulk")).thenReturn(false);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> authService.register(request));

        assertEquals("Email is required", ex.getMessage());
        verify(userRepository, never()).save(any());
    }
}
