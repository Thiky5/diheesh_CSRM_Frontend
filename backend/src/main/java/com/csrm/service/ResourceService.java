package com.csrm.service;

import com.csrm.dto.ResourceDto;
import com.csrm.entity.Resource;
import com.csrm.entity.ResourceType;
import com.csrm.exception.ResourceNotFoundException;
import com.csrm.repository.ResourceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final AuditLogService auditLogService;

    public ResourceService(ResourceRepository resourceRepository, AuditLogService auditLogService) {
        this.resourceRepository = resourceRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<ResourceDto> getAllResources(ResourceType type, String search) {
        List<Resource> list = resourceRepository.searchResources(type, search != null && !search.trim().isEmpty() ? search.trim() : null);
        return list.stream().map(ResourceDto::new).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ResourceDto> getAvailableResources(LocalDateTime startTime, LocalDateTime endTime) {
        if (startTime != null && endTime != null) {
            return resourceRepository.findAvailableResourcesBetween(startTime, endTime)
                    .stream()
                    .map(ResourceDto::new)
                    .collect(Collectors.toList());
        }
        return resourceRepository.findByAvailabilityTrue()
                .stream()
                .map(ResourceDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ResourceDto getResourceById(Long id) {
        Resource r = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        return new ResourceDto(r);
    }

    @Transactional
    public ResourceDto createResource(ResourceDto dto, String adminUsername) {
        Resource resource = new Resource(
                dto.getName(),
                dto.getType(),
                dto.getLocation(),
                dto.getAvailability() != null ? dto.getAvailability() : true,
                dto.getCapacity(),
                dto.getDescription(),
                dto.getHourlyRate() != null ? dto.getHourlyRate() : 0.0
        );

        Resource saved = resourceRepository.save(resource);

        auditLogService.log(
                null,
                adminUsername,
                "RESOURCE_CREATED",
                "Resource",
                saved.getId(),
                String.format("Created %s (%s) at %s", saved.getName(), saved.getType(), saved.getLocation())
        );

        return new ResourceDto(saved);
    }

    @Transactional
    public ResourceDto updateResource(Long id, ResourceDto dto, String adminUsername) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        resource.setName(dto.getName());
        resource.setType(dto.getType());
        resource.setLocation(dto.getLocation());
        resource.setAvailability(dto.getAvailability());
        resource.setCapacity(dto.getCapacity());
        resource.setDescription(dto.getDescription());
        resource.setHourlyRate(dto.getHourlyRate());

        Resource updated = resourceRepository.save(resource);

        auditLogService.log(
                null,
                adminUsername,
                "RESOURCE_UPDATED",
                "Resource",
                updated.getId(),
                String.format("Updated resource %s", updated.getName())
        );

        return new ResourceDto(updated);
    }

    @Transactional
    public void deleteResource(Long id, String adminUsername) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        String name = resource.getName();
        resourceRepository.delete(resource);

        auditLogService.log(
                null,
                adminUsername,
                "RESOURCE_DELETED",
                "Resource",
                id,
                String.format("Deleted resource %s", name)
        );
    }
}
