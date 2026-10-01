package com.csrm.service;

import com.csrm.dto.AdminCreateUserRequest;
import com.csrm.dto.AdminUpdateUserRequest;
import com.csrm.dto.UserDto;
import com.csrm.dto.UserStatusUpdateRequest;
import com.csrm.entity.Role;
import com.csrm.entity.User;
import com.csrm.entity.UserStatus;
import com.csrm.exception.BadRequestException;
import com.csrm.exception.ResourceNotFoundException;
import com.csrm.repository.BookingRepository;
import com.csrm.repository.NotificationRepository;
import com.csrm.repository.ServiceRequestRepository;
import com.csrm.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final NotificationRepository notificationRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    public UserService(UserRepository userRepository,
                       BookingRepository bookingRepository,
                       NotificationRepository notificationRepository,
                       ServiceRequestRepository serviceRequestRepository,
                       PasswordEncoder passwordEncoder,
                       AuditLogService auditLogService,
                       NotificationService notificationService) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.notificationRepository = notificationRepository;
        this.serviceRequestRepository = serviceRequestRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserDto> getPendingUsers() {
        return userRepository.findByStatus(UserStatus.PENDING)
                .stream()
                .map(UserDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDto createUserByAdmin(AdminCreateUserRequest request, String adminUsername) {
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

        String normalizedUsername = request.getUsername().trim();
        String normalizedEmail = request.getEmail().trim();

        if (userRepository.existsByUsername(normalizedUsername)) {
            throw new BadRequestException("Username '" + normalizedUsername + "' is already taken");
        }
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BadRequestException("Email '" + normalizedEmail + "' is already registered");
        }

        UserStatus initialStatus = request.getStatus() != null ? request.getStatus() : UserStatus.APPROVED;

        User user = new User(
                normalizedUsername,
                passwordEncoder.encode(request.getPassword()),
                request.getFullName().trim(),
                normalizedEmail,
                request.getRole(),
                initialStatus
        );

        User saved = userRepository.save(user);

        auditLogService.log(
                null,
                adminUsername,
                "ADMIN_USER_CREATED",
                "User",
                saved.getId(),
                String.format("Admin created user %s (%s) with role %s and status %s",
                        saved.getUsername(), saved.getFullName(), saved.getRole(), saved.getStatus())
        );

        String msg = (saved.getStatus() == UserStatus.APPROVED)
                ? "Your CSRM campus account has been created and approved by an administrator. You can now log in!"
                : "Your CSRM campus account has been created and is pending approval.";
        notificationService.sendNotification(saved, "Welcome to CSRM", msg, "EMAIL");

        return new UserDto(saved);
    }

    @Transactional
    public UserDto updateUserByAdmin(Long userId, AdminUpdateUserRequest request, String adminUsername) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Check if username is admin and trying to revoke
        if (user.getUsername().equalsIgnoreCase("admin") && request.getStatus() != UserStatus.APPROVED) {
            throw new BadRequestException("Primary administrator status cannot be revoked");
        }
        if (user.getUsername().equalsIgnoreCase(adminUsername) && request.getStatus() != UserStatus.APPROVED) {
            throw new BadRequestException("You cannot revoke your own administrator account");
        }

        // Email uniqueness check if email modified
        if (!user.getEmail().equalsIgnoreCase(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email '" + request.getEmail() + "' is already used by another account");
        }

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());
        user.setStatus(request.getStatus());

        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword().trim()));
        }

        User updated = userRepository.save(user);

        auditLogService.log(
                null,
                adminUsername,
                "ADMIN_USER_UPDATED",
                "User",
                updated.getId(),
                String.format("Admin updated user details for %s (Role: %s, Status: %s)",
                        updated.getUsername(), updated.getRole(), updated.getStatus())
        );

        return new UserDto(updated);
    }

    @Transactional
    public void deleteUserByAdmin(Long userId, String adminUsername) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (user.getUsername().equalsIgnoreCase("admin")) {
            throw new BadRequestException("Cannot delete the primary administrator account");
        }
        if (user.getUsername().equalsIgnoreCase(adminUsername)) {
            throw new BadRequestException("You cannot delete your own logged-in administrator account");
        }

        // Cascade delete child entities
        bookingRepository.deleteByUserId(userId);
        notificationRepository.deleteByUserId(userId);
        serviceRequestRepository.deleteByUserId(userId);

        userRepository.delete(user);

        auditLogService.log(
                null,
                adminUsername,
                "ADMIN_USER_DELETED",
                "User",
                userId,
                String.format("Admin permanently deleted user account: %s (@%s)", user.getFullName(), user.getUsername())
        );
    }

    @Transactional
    public UserDto updateUserStatus(Long userId, UserStatusUpdateRequest request, String adminUsername) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (user.getUsername().equalsIgnoreCase(adminUsername) && request.getStatus() != UserStatus.APPROVED) {
            throw new BadRequestException("Administrators cannot revoke their own account status");
        }

        UserStatus previousStatus = user.getStatus();
        user.setStatus(request.getStatus());

        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        User updated = userRepository.save(user);

        // Audit log
        auditLogService.log(
                null,
                adminUsername,
                "ADMIN_USER_STATUS_CHANGE",
                "User",
                updated.getId(),
                String.format("Status of user %s changed from %s to %s", updated.getUsername(), previousStatus, updated.getStatus())
        );

        // Trigger Notification & Email/SMS alert to the user
        String title = "CSRM Account Status Update";
        String message = (updated.getStatus() == UserStatus.APPROVED)
                ? "Your account has been APPROVED by an administrator! You can now log in and access all campus resource features."
                : "Your account registration was " + updated.getStatus().name() + " by the administrator.";

        notificationService.sendNotification(updated, title, message, "EMAIL");

        return new UserDto(updated);
    }

    @Transactional
    public UserDto updateUserRole(Long userId, Role newRole, String adminUsername) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (user.getUsername().equalsIgnoreCase("admin") && newRole != Role.ADMIN) {
            throw new BadRequestException("The primary administrator account cannot be demoted");
        }

        Role prevRole = user.getRole();
        user.setRole(newRole);
        User updated = userRepository.save(user);

        auditLogService.log(
                null,
                adminUsername,
                "ADMIN_USER_ROLE_CHANGE",
                "User",
                updated.getId(),
                String.format("Role of %s changed from %s to %s", updated.getUsername(), prevRole, newRole)
        );

        notificationService.sendNotification(
                updated,
                "Role Updated",
                "Your CSRM role has been updated to " + newRole.name() + ".",
                "SYSTEM"
        );

        return new UserDto(updated);
    }
}
