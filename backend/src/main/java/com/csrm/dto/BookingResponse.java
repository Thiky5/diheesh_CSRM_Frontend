package com.csrm.dto;

import com.csrm.entity.Booking;
import com.csrm.entity.BookingStatus;
import com.csrm.entity.ResourceType;

import java.time.LocalDateTime;

public class BookingResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private Long resourceId;
    private String resourceName;
    private ResourceType resourceType;
    private String resourceLocation;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BookingStatus status;
    private String purpose;
    private String notes;
    private LocalDateTime createdAt;

    public BookingResponse() {}

    public BookingResponse(Booking booking) {
        this.id = booking.getId();
        if (booking.getUser() != null) {
            this.userId = booking.getUser().getId();
            this.userName = booking.getUser().getFullName();
            this.userEmail = booking.getUser().getEmail();
        }
        if (booking.getResource() != null) {
            this.resourceId = booking.getResource().getId();
            this.resourceName = booking.getResource().getName();
            this.resourceType = booking.getResource().getType();
            this.resourceLocation = booking.getResource().getLocation();
        }
        this.startTime = booking.getStartTime();
        this.endTime = booking.getEndTime();
        this.status = booking.getStatus();
        this.purpose = booking.getPurpose();
        this.notes = booking.getNotes();
        this.createdAt = booking.getCreatedAt();
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

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
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

    public ResourceType getResourceType() {
        return resourceType;
    }

    public void setResourceType(ResourceType resourceType) {
        this.resourceType = resourceType;
    }

    public String getResourceLocation() {
        return resourceLocation;
    }

    public void setResourceLocation(String resourceLocation) {
        this.resourceLocation = resourceLocation;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
