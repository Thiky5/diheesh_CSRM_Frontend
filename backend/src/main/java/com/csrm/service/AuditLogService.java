package com.csrm.service;

import com.csrm.dto.AuditLogDto;
import com.csrm.entity.AuditLog;
import com.csrm.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void log(Long userId, String username, String action, String entityName, Long entityId, String details) {
        AuditLog log = new AuditLog(userId, username != null ? username : "SYSTEM", action, entityName, entityId, details);
        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<AuditLogDto> getAllLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc()
                .stream()
                .map(AuditLogDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AuditLogDto> getFilteredLogs(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        return auditLogRepository.findFilteredAuditLogs(userId, startDate, endDate)
                .stream()
                .map(AuditLogDto::new)
                .collect(Collectors.toList());
    }
}
