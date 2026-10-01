package com.csrm.controller;

import com.csrm.dto.*;
import com.csrm.entity.Role;
import com.csrm.entity.User;
import com.csrm.entity.UserStatus;
import com.csrm.service.AuthService;
import com.csrm.service.BookingService;
import com.csrm.service.ReportService;
import com.csrm.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final AuthService authService;
    private final ReportService reportService;
    private final BookingService bookingService;

    public AdminController(UserService userService,
                           AuthService authService,
                           ReportService reportService,
                           BookingService bookingService) {
        this.userService = userService;
        this.authService = authService;
        this.reportService = reportService;
        this.bookingService = bookingService;
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserDto>>> getUsers(@RequestParam(required = false) UserStatus status) {
        List<UserDto> users = (status == UserStatus.PENDING)
                ? userService.getPendingUsers()
                : userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<UserDto>> createUser(@Valid @RequestBody AdminCreateUserRequest request) {
        User admin = authService.getCurrentAuthenticatedUser();
        UserDto created = userService.createUserByAdmin(request, admin.getUsername());
        return new ResponseEntity<>(ApiResponse.success("User account created successfully", created), org.springframework.http.HttpStatus.CREATED);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody AdminUpdateUserRequest request) {
        User admin = authService.getCurrentAuthenticatedUser();
        UserDto updated = userService.updateUserByAdmin(id, request, admin.getUsername());
        return ResponseEntity.ok(ApiResponse.success("User account updated successfully", updated));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        User admin = authService.getCurrentAuthenticatedUser();
        userService.deleteUserByAdmin(id, admin.getUsername());
        return ResponseEntity.ok(ApiResponse.success("User account deleted successfully", null));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<UserDto>> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UserStatusUpdateRequest request) {
        User admin = authService.getCurrentAuthenticatedUser();
        UserDto updated = userService.updateUserStatus(id, request, admin.getUsername());
        return ResponseEntity.ok(ApiResponse.success("User account status updated to " + updated.getStatus(), updated));
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<UserDto>> updateUserRole(
            @PathVariable Long id,
            @RequestParam Role role) {
        User admin = authService.getCurrentAuthenticatedUser();
        UserDto updated = userService.updateUserRole(id, role, admin.getUsername());
        return ResponseEntity.ok(ApiResponse.success("User role updated to " + updated.getRole(), updated));
    }

    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<ReportSummaryDto>> getReports() {
        ReportSummaryDto summary = reportService.getSummaryReport();
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getAllBookings() {
        List<BookingResponse> list = bookingService.getAllBookings();
        return ResponseEntity.ok(ApiResponse.success(list));
    }
}
