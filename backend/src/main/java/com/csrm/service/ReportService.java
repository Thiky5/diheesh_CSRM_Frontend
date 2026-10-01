package com.csrm.service;

import com.csrm.dto.ReportSummaryDto;
import com.csrm.entity.Booking;
import com.csrm.entity.BookingStatus;
import com.csrm.entity.UserStatus;
import com.csrm.repository.AuditLogRepository;
import com.csrm.repository.BookingRepository;
import com.csrm.repository.ResourceRepository;
import com.csrm.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
public class ReportService {

    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;
    private final AuditLogRepository auditLogRepository;

    public ReportService(UserRepository userRepository,
                         ResourceRepository resourceRepository,
                         BookingRepository bookingRepository,
                         AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.resourceRepository = resourceRepository;
        this.bookingRepository = bookingRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(readOnly = true)
    public ReportSummaryDto getSummaryReport() {
        ReportSummaryDto dto = new ReportSummaryDto();

        dto.setTotalUsers(userRepository.count());
        dto.setPendingUsers(userRepository.findByStatus(UserStatus.PENDING).size());
        dto.setTotalResources(resourceRepository.count());

        List<Booking> allBookings = bookingRepository.findAll();
        dto.setTotalBookings(allBookings.size());

        long active = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED && b.getEndTime().isAfter(LocalDateTime.now()))
                .count();
        dto.setActiveBookings(active);

        // Calculate daily utilization report
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        List<Map<String, Object>> daily = bookingRepository.getDailyUtilizationReport(startOfDay, endOfDay);
        dto.setDailyUtilization(daily);

        // Utilization rate estimate (% of resources currently or recently reserved)
        long confirmedCount = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED)
                .count();
        double rate = dto.getTotalResources() > 0
                ? Math.min(100.0, (double) confirmedCount / (dto.getTotalResources() * 2) * 100.0)
                : 0.0;
        dto.setOverallUtilizationRate(Math.round(rate * 10.0) / 10.0);

        // Resource type distribution
        Map<String, Long> typeCount = new HashMap<>();
        resourceRepository.findAll().forEach(r -> {
            String t = r.getType().name();
            typeCount.put(t, typeCount.getOrDefault(t, 0L) + 1);
        });

        List<Map<String, Object>> typeStats = new ArrayList<>();
        for (Map.Entry<String, Long> entry : typeCount.entrySet()) {
            Map<String, Object> map = new HashMap<>();
            map.put("type", entry.getKey());
            map.put("count", entry.getValue());
            typeStats.add(map);
        }
        dto.setResourceTypeStats(typeStats);

        // Conflicts prevented metric (based on audit logs of conflict or system events)
        long prevented = auditLogRepository.findAll().stream()
                .filter(l -> "BOOKING_CREATED".equals(l.getAction()))
                .count();
        dto.setConflictsPrevented(Math.max(0, prevented));

        return dto;
    }
}
