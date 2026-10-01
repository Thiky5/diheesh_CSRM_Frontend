package com.csrm.dto;

import java.util.List;
import java.util.Map;

public class ReportSummaryDto {
    private long totalUsers;
    private long pendingUsers;
    private long totalResources;
    private long activeBookings;
    private long totalBookings;
    private long conflictsPrevented;
    private double overallUtilizationRate;
    private List<Map<String, Object>> dailyUtilization;
    private List<Map<String, Object>> resourceTypeStats;

    public ReportSummaryDto() {}

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getPendingUsers() {
        return pendingUsers;
    }

    public void setPendingUsers(long pendingUsers) {
        this.pendingUsers = pendingUsers;
    }

    public long getTotalResources() {
        return totalResources;
    }

    public void setTotalResources(long totalResources) {
        this.totalResources = totalResources;
    }

    public long getActiveBookings() {
        return activeBookings;
    }

    public void setActiveBookings(long activeBookings) {
        this.activeBookings = activeBookings;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public long getConflictsPrevented() {
        return conflictsPrevented;
    }

    public void setConflictsPrevented(long conflictsPrevented) {
        this.conflictsPrevented = conflictsPrevented;
    }

    public double getOverallUtilizationRate() {
        return overallUtilizationRate;
    }

    public void setOverallUtilizationRate(double overallUtilizationRate) {
        this.overallUtilizationRate = overallUtilizationRate;
    }

    public List<Map<String, Object>> getDailyUtilization() {
        return dailyUtilization;
    }

    public void setDailyUtilization(List<Map<String, Object>> dailyUtilization) {
        this.dailyUtilization = dailyUtilization;
    }

    public List<Map<String, Object>> getResourceTypeStats() {
        return resourceTypeStats;
    }

    public void setResourceTypeStats(List<Map<String, Object>> resourceTypeStats) {
        this.resourceTypeStats = resourceTypeStats;
    }
}
