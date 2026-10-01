package com.csrm.dto;

import com.csrm.entity.Role;
import com.csrm.entity.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AdminUpdateUserRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Valid email is required")
    private String email;

    @NotNull(message = "Role is required")
    private Role role;

    @NotNull(message = "Status is required")
    private UserStatus status;

    private String password; // Optional: new password if updating

    public AdminUpdateUserRequest() {}

    public AdminUpdateUserRequest(String fullName, String email, Role role, UserStatus status, String password) {
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.status = status;
        this.password = password;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public UserStatus getStatus() {
        return status;
    }

    public void setStatus(UserStatus status) {
        this.status = status;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
