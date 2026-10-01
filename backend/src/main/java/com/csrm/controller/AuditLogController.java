package com.csrm.controller;

import com.csrm.dto.ApiResponse;
import com.csrm.dto.AuditLogDto;
import com.csrm.service.AuditLogService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/audit")
@PreAuthorize("hasRole('ADMIN')")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AuditLogDto>>> getAuditLogs(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        List<AuditLogDto> logs;
        if (userId != null || startDate != null || endDate != null) {
            logs = auditLogService.getFilteredLogs(userId, startDate, endDate);
        } else {
            logs = auditLogService.getAllLogs();
        }
        return ResponseEntity.ok(ApiResponse.success(logs));
    }
}
