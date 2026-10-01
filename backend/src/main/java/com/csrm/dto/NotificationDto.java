package com.csrm.dto;

import com.csrm.entity.Notification;
import java.time.LocalDateTime;

public class NotificationDto {
    private Long id;
    private Long userId;
    private String title;
    private String message;
    private String channel;
    private Boolean isRead;
    private LocalDateTime createdAt;

    public NotificationDto() {}

    public NotificationDto(Notification notification) {
        this.id = notification.getId();
        if (notification.getUser() != null) {
            this.userId = notification.getUser().getId();
        }
        this.title = notification.getTitle();
        this.message = notification.getMessage();
        this.channel = notification.getChannel();
        this.isRead = notification.getIsRead();
        this.createdAt = notification.getCreatedAt();
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getChannel() {
        return channel;
    }

    public void setChannel(String channel) {
        this.channel = channel;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
