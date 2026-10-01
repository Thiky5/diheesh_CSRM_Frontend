package com.csrm.dto;

import com.csrm.entity.Role;
import com.csrm.entity.UserStatus;
import jakarta.validation.constraints.NotNull;

public class UserStatusUpdateRequest {
    @NotNull(message = "Status is required")
    private UserStatus status;

    private Role role; // Optional role adjustment by Admin

    public UserStatusUpdateRequest() {}

    public UserStatusUpdateRequest(UserStatus status, Role role) {
        this.status = status;
        this.role = role;
    }

    public UserStatus getStatus() {
        return status;
    }

    public void setStatus(UserStatus status) {
        this.status = status;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
