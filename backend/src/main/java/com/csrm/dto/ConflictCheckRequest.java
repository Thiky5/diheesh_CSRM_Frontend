package com.csrm.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class ConflictCheckRequest {
    @NotNull
    private Long resourceId;

    @NotNull
    private LocalDateTime startTime;

    @NotNull
    private LocalDateTime endTime;

    private Long excludeBookingId;

    public ConflictCheckRequest() {}

    public ConflictCheckRequest(Long resourceId, LocalDateTime startTime, LocalDateTime endTime, Long excludeBookingId) {
        this.resourceId = resourceId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.excludeBookingId = excludeBookingId;
    }

    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
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

    public Long getExcludeBookingId() {
        return excludeBookingId;
    }

    public void setExcludeBookingId(Long excludeBookingId) {
        this.excludeBookingId = excludeBookingId;
    }
}
