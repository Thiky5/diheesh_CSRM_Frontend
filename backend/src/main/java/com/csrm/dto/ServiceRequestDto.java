package com.csrm.dto;

import com.csrm.entity.ServiceRequest;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class ServiceRequestDto {
    private Long id;
    private Long userId;
    private String userName;
    private Long resourceId;
    private String resourceName;

    @NotBlank(message = "Service type is required")
    private String serviceType;

    @NotBlank(message = "Description is required")
    private String description;

    private String status;
    private String adminNotes;
    private LocalDateTime createdAt;

    public ServiceRequestDto() {}

    public ServiceRequestDto(ServiceRequest sr) {
        this.id = sr.getId();
        if (sr.getUser() != null) {
            this.userId = sr.getUser().getId();
            this.userName = sr.getUser().getFullName();
        }
        if (sr.getResource() != null) {
            this.resourceId = sr.getResource().getId();
            this.resourceName = sr.getResource().getName();
        }
        this.serviceType = sr.getServiceType();
        this.description = sr.getDescription();
        this.status = sr.getStatus();
        this.adminNotes = sr.getAdminNotes();
        this.createdAt = sr.getCreatedAt();
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

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    public String getResourceName() {
        return resourceName;
    }

    public void setResourceName(String resourceName) {
        this.resourceName = resourceName;
    }

    public String getServiceType() {
        return serviceType;
    }

    public void setServiceType(String serviceType) {
        this.serviceType = serviceType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAdminNotes() {
        return adminNotes;
    }

    public void setAdminNotes(String adminNotes) {
        this.adminNotes = adminNotes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
