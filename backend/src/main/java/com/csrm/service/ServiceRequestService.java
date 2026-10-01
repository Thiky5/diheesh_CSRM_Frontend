package com.csrm.service;

import com.csrm.dto.ServiceRequestDto;
import com.csrm.entity.Resource;
import com.csrm.entity.ServiceRequest;
import com.csrm.entity.User;
import com.csrm.exception.ResourceNotFoundException;
import com.csrm.repository.ResourceRepository;
import com.csrm.repository.ServiceRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ServiceRequestService {

    private final ServiceRequestRepository serviceRequestRepository;
    private final ResourceRepository resourceRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    public ServiceRequestService(ServiceRequestRepository serviceRequestRepository,
                                 ResourceRepository resourceRepository,
                                 AuditLogService auditLogService,
                                 NotificationService notificationService) {
        this.serviceRequestRepository = serviceRequestRepository;
        this.resourceRepository = resourceRepository;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
    }

    @Transactional
    public ServiceRequestDto createRequest(ServiceRequestDto dto, User user) {
        Resource resource = null;
        if (dto.getResourceId() != null) {
            resource = resourceRepository.findById(dto.getResourceId()).orElse(null);
        }

        ServiceRequest sr = new ServiceRequest(user, resource, dto.getServiceType(), dto.getDescription());
        ServiceRequest saved = serviceRequestRepository.save(sr);

        auditLogService.log(
                user.getId(),
                user.getUsername(),
                "SERVICE_REQUEST_CREATED",
                "ServiceRequest",
                saved.getId(),
                "Requested service: " + dto.getServiceType()
        );

        notificationService.sendNotification(
                user,
                "Service Request Received",
                "Your request for '" + dto.getServiceType() + "' has been submitted to campus operations.",
                "SYSTEM"
        );

        return new ServiceRequestDto(saved);
    }

    @Transactional(readOnly = true)
    public List<ServiceRequestDto> getUserRequests(Long userId) {
        return serviceRequestRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(ServiceRequestDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ServiceRequestDto> getAllRequests() {
        return serviceRequestRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(ServiceRequestDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public ServiceRequestDto updateRequestStatus(Long id, String status, String adminNotes, String adminUsername) {
        ServiceRequest sr = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found"));

        sr.setStatus(status);
        if (adminNotes != null) sr.setAdminNotes(adminNotes);
        ServiceRequest saved = serviceRequestRepository.save(sr);

        auditLogService.log(
                null,
                adminUsername,
                "SERVICE_REQUEST_UPDATED",
                "ServiceRequest",
                saved.getId(),
                "Status updated to: " + status
        );

        notificationService.sendNotification(
                saved.getUser(),
                "Service Request Status: " + status,
                "Your request for '" + saved.getServiceType() + "' has been updated to: " + status + (adminNotes != null ? " Notes: " + adminNotes : ""),
                "EMAIL"
        );

        return new ServiceRequestDto(saved);
    }
}
