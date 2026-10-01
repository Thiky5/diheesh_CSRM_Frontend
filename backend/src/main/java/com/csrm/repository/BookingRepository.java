package com.csrm.repository;

import com.csrm.entity.Booking;
import com.csrm.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserIdOrderByStartTimeDesc(Long userId);

    void deleteByUserId(Long userId);

    List<Booking> findByResourceIdOrderByStartTimeDesc(Long resourceId);

    List<Booking> findByStatusOrderByStartTimeDesc(BookingStatus status);

    // Detect overlapping bookings (JPQL)
    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId " +
           "AND b.status IN (com.csrm.entity.BookingStatus.CONFIRMED, com.csrm.entity.BookingStatus.PENDING) " +
           "AND (:excludeBookingId IS NULL OR b.id != :excludeBookingId) " +
           "AND (b.startTime < :endTime AND b.endTime > :startTime)")
    List<Booking> findOverlappingBookings(
            @Param("resourceId") Long resourceId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("excludeBookingId") Long excludeBookingId
    );

    // Native SQL Query for detecting overlapping bookings
    @Query(value = "SELECT * FROM bookings b " +
                   "WHERE b.resource_id = :resourceId " +
                   "AND b.status IN ('CONFIRMED', 'PENDING') " +
                   "AND (:excludeBookingId IS NULL OR b.id <> :excludeBookingId) " +
                   "AND (b.start_time < :endTime AND b.end_time > :startTime)",
           nativeQuery = true)
    List<Booking> findOverlappingBookingsNative(
            @Param("resourceId") Long resourceId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("excludeBookingId") Long excludeBookingId
    );

    // Native SQL Query: Daily resource utilization report
    @Query(value = "SELECT r.id AS resourceId, r.name AS resourceName, r.type AS resourceType, " +
                   "COUNT(b.id) AS totalBookings, " +
                   "COALESCE(SUM(TIMESTAMPDIFF(MINUTE, b.start_time, b.end_time)), 0) AS totalMinutesBooked " +
                   "FROM resources r " +
                   "LEFT JOIN bookings b ON r.id = b.resource_id " +
                   "AND b.status = 'CONFIRMED' " +
                   "AND b.start_time >= :dayStart AND b.end_time <= :dayEnd " +
                   "GROUP BY r.id, r.name, r.type",
           nativeQuery = true)
    List<Map<String, Object>> getDailyUtilizationReport(
            @Param("dayStart") LocalDateTime dayStart,
            @Param("dayEnd") LocalDateTime dayEnd
    );

    // User's upcoming bookings
    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId AND b.endTime >= :now ORDER BY b.startTime ASC")
    List<Booking> findUpcomingBookingsByUser(@Param("userId") Long userId, @Param("now") LocalDateTime now);

    // User's past bookings
    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId AND b.endTime < :now ORDER BY b.startTime DESC")
    List<Booking> findPastBookingsByUser(@Param("userId") Long userId, @Param("now") LocalDateTime now);
}
