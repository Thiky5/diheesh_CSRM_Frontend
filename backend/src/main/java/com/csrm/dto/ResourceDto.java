package com.csrm.dto;

import com.csrm.entity.Resource;
import com.csrm.entity.ResourceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public class ResourceDto {
    private Long id;

    @NotBlank(message = "Resource name is required")
    private String name;

    @NotNull(message = "Resource type is required")
    private ResourceType type;

    @NotBlank(message = "Location is required")
    private String location;

    private Boolean availability = true;

    @NotNull(message = "Capacity is required")
    @PositiveOrZero(message = "Capacity must be >= 0")
    private Integer capacity = 1;

    private String description;

    @NotNull(message = "Hourly rate is required")
    @PositiveOrZero(message = "Hourly rate must be >= 0")
    private Double hourlyRate = 0.0;

    public ResourceDto() {}

    public ResourceDto(Resource resource) {
        this.id = resource.getId();
        this.name = resource.getName();
        this.type = resource.getType();
        this.location = resource.getLocation();
        this.availability = resource.getAvailability();
        this.capacity = resource.getCapacity();
        this.description = resource.getDescription();
        this.hourlyRate = resource.getHourlyRate();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ResourceType getType() {
        return type;
    }

    public void setType(ResourceType type) {
        this.type = type;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Boolean getAvailability() {
        return availability;
    }

    public void setAvailability(Boolean availability) {
        this.availability = availability;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(Double hourlyRate) {
        this.hourlyRate = hourlyRate;
    }
}
