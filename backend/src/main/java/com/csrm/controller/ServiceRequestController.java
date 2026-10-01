package com.csrm.controller;

import com.csrm.dto.ApiResponse;
import com.csrm.dto.ServiceRequestDto;
import com.csrm.entity.Role;
import com.csrm.entity.User;
import com.csrm.service.AuthService;
import com.csrm.service.ServiceRequestService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/services")
public class ServiceRequestController {

    private final ServiceRequestService serviceRequestService;
    private final AuthService authService;

    public ServiceRequestController(ServiceRequestService serviceRequestService, AuthService authService) {
        this.serviceRequestService = serviceRequestService;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ServiceRequestDto>> createRequest(@Valid @RequestBody ServiceRequestDto dto) {
        User user = authService.getCurrentAuthenticatedUser();
        ServiceRequestDto created = serviceRequestService.createRequest(dto, user);
        return ResponseEntity.ok(ApiResponse.success("Service request submitted successfully", created));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<ServiceRequestDto>>> getMyRequests() {
        User user = authService.getCurrentAuthenticatedUser();
        List<ServiceRequestDto> list = serviceRequestService.getUserRequests(user.getId());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ServiceRequestDto>>> getAllRequests() {
        List<ServiceRequestDto> list = serviceRequestService.getAllRequests();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ServiceRequestDto>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        User admin = authService.getCurrentAuthenticatedUser();
        String status = payload.get("status");
        String adminNotes = payload.get("adminNotes");
        ServiceRequestDto updated = serviceRequestService.updateRequestStatus(id, status, adminNotes, admin.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Service request status updated", updated));
    }
}
