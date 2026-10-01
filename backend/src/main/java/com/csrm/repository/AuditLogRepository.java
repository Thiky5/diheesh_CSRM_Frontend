package com.csrm.repository;

import com.csrm.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findAllByOrderByTimestampDesc();

    // Retrieve audit logs filtered by user / date (JPQL)
    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:userId IS NULL OR a.userId = :userId) AND " +
           "(:startDate IS NULL OR a.timestamp >= :startDate) AND " +
           "(:endDate IS NULL OR a.timestamp <= :endDate) " +
           "ORDER BY a.timestamp DESC")
    List<AuditLog> findFilteredAuditLogs(
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // Retrieve audit logs filtered by user / date (Native SQL)
    @Query(value = "SELECT * FROM audit_logs a WHERE " +
                   "(:userId IS NULL OR a.user_id = :userId) AND " +
                   "(:startDate IS NULL OR a.timestamp >= :startDate) AND " +
                   "(:endDate IS NULL OR a.timestamp <= :endDate) " +
                   "ORDER BY a.timestamp DESC",
           nativeQuery = true)
    List<AuditLog> findFilteredAuditLogsNative(
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}
