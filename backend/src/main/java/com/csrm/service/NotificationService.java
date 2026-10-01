package com.csrm.service;

import com.csrm.dto.NotificationDto;
import com.csrm.entity.Notification;
import com.csrm.entity.User;
import com.csrm.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public Notification sendNotification(User user, String title, String message, String channel) {
        Notification notification = new Notification(user, title, message, channel);
        Notification saved = notificationRepository.save(notification);

        // Simulate Email / SMS dispatch
        if ("EMAIL".equalsIgnoreCase(channel) || "ALL".equalsIgnoreCase(channel)) {
            logger.info("[EMAIL DISPATCHED] To: {} <{}> | Subject: {} | Content: {}",
                    user.getFullName(), user.getEmail(), title, message);
        }
        if ("SMS".equalsIgnoreCase(channel) || "ALL".equalsIgnoreCase(channel)) {
            logger.info("[SMS ALERT SENT] To: {} | Msg: {}", user.getFullName(), message);
        }

        return saved;
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
        });
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (Notification n : list) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(list);
    }
}
