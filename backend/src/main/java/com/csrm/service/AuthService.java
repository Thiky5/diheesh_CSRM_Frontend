package com.csrm.service;

import com.csrm.dto.AuthRequest;
import com.csrm.dto.AuthResponse;
import com.csrm.dto.RegisterRequest;
import com.csrm.dto.UserDto;
import com.csrm.entity.Role;
import com.csrm.entity.User;
import com.csrm.entity.UserStatus;
import com.csrm.exception.BadRequestException;
import com.csrm.repository.UserRepository;
import com.csrm.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider,
                       AuditLogService auditLogService,
                       NotificationService notificationService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
    }

    @Transactional
    public UserDto register(RegisterRequest request) {
        if (request == null) {
            throw new BadRequestException("Request body is required");
        }
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            throw new BadRequestException("Username is required");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new BadRequestException("Password is required");
        }
        if (request.getFullName() == null || request.getFullName().isBlank()) {
            throw new BadRequestException("Full name is required");
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new BadRequestException("Email is required");
        }
        if (request.getRole() == null) {
            throw new BadRequestException("Role is required");
        }

        String normalizedEmail = request.getEmail().trim();
        String normalizedUsername = request.getUsername().trim();

        if (userRepository.existsByUsername(normalizedUsername)) {
            throw new BadRequestException("Username is already taken");
        }
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BadRequestException("Email is already registered");
        }

        // Students and Faculty require Admin approval by default. Admin accounts can be created approved.
        UserStatus initialStatus = (request.getRole() == Role.ADMIN) ? UserStatus.APPROVED : UserStatus.PENDING;

        User user = new User(
                normalizedUsername,
                passwordEncoder.encode(request.getPassword()),
                request.getFullName().trim(),
                normalizedEmail,
                request.getRole(),
                initialStatus
        );

        User saved = userRepository.save(user);

        // Audit log
        auditLogService.log(
                saved.getId(),
                saved.getUsername(),
                "USER_REGISTERED",
                "User",
                saved.getId(),
                "Registered with role: " + saved.getRole() + ", Status: " + saved.getStatus()
        );

        // Initial welcome notification
        String msg = (saved.getStatus() == UserStatus.PENDING)
                ? "Welcome to CSRM! Your account is currently pending administrator approval. You will receive an alert once approved."
                : "Welcome to CSRM! Your account is active. You can now manage campus resources.";

        notificationService.sendNotification(saved, "Welcome to CSRM", msg, "EMAIL");

        return new UserDto(saved);
    }

    @Transactional
    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        if (user.getStatus() == UserStatus.PENDING) {
            throw new DisabledException("Your account is pending administrator approval. Please wait for approval.");
        } else if (user.getStatus() == UserStatus.REJECTED) {
            throw new DisabledException("Your account registration was rejected by the administrator.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        auditLogService.log(
                user.getId(),
                user.getUsername(),
                "USER_LOGIN",
                "User",
                user.getId(),
                "User logged in successfully"
        );

        return new AuthResponse(
                jwt,
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getStatus()
        );
    }

    @Transactional(readOnly = true)
    public User getCurrentAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new BadCredentialsException("No authenticated user in context");
        }
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new BadRequestException("Current user not found"));
    }
}
