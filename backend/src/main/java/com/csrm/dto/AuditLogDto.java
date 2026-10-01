package com.csrm.dto;

import com.csrm.entity.AuditLog;
import java.time.LocalDateTime;

public class AuditLogDto {
    private Long id;
    private Long userId;
    private String username;
    private String action;
    private String entityName;
    private Long entityId;
    private String details;
    private LocalDateTime timestamp;

    public AuditLogDto() {}

    public AuditLogDto(AuditLog log) {
        this.id = log.getId();
        this.userId = log.getUserId();
        this.username = log.getUsername();
        this.action = log.getAction();
        this.entityName = log.getEntityName();
        this.entityId = log.getEntityId();
        this.details = log.getDetails();
        this.timestamp = log.getTimestamp();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getEntityName() {
        return entityName;
    }

    public void setEntityName(String entityName) {
        this.entityName = entityName;
    }

    public Long getEntityId() {
        return entityId;
    }

    public void setEntityId(Long entityId) {
        this.entityId = entityId;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
