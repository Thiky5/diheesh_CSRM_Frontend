package com.csrm.controller;

import com.csrm.dto.ApiResponse;
import com.csrm.dto.ResourceDto;
import com.csrm.entity.ResourceType;
import com.csrm.entity.User;
import com.csrm.service.AuthService;
import com.csrm.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    private final ResourceService resourceService;
    private final AuthService authService;

    public ResourceController(ResourceService resourceService, AuthService authService) {
        this.resourceService = resourceService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ResourceDto>>> getAllResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) String search) {
        List<ResourceDto> resources = resourceService.getAllResources(type, search);
        return ResponseEntity.ok(ApiResponse.success(resources));
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<ResourceDto>>> getAvailableResources(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        List<ResourceDto> resources = resourceService.getAvailableResources(startTime, endTime);
        return ResponseEntity.ok(ApiResponse.success(resources));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResourceDto>> getResourceById(@PathVariable Long id) {
        ResourceDto dto = resourceService.getResourceById(id);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ResourceDto>> createResource(@Valid @RequestBody ResourceDto dto) {
        User admin = authService.getCurrentAuthenticatedUser();
        ResourceDto created = resourceService.createResource(dto, admin.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Resource created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ResourceDto>> updateResource(@PathVariable Long id, @Valid @RequestBody ResourceDto dto) {
        User admin = authService.getCurrentAuthenticatedUser();
        ResourceDto updated = resourceService.updateResource(id, dto, admin.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Resource updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteResource(@PathVariable Long id) {
        User admin = authService.getCurrentAuthenticatedUser();
        resourceService.deleteResource(id, admin.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Resource removed successfully", null));
    }
}
