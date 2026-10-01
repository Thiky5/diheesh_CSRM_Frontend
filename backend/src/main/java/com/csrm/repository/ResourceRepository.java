package com.csrm.repository;

import com.csrm.entity.Resource;
import com.csrm.entity.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByType(ResourceType type);
    List<Resource> findByAvailabilityTrue();

    @Query("SELECT r FROM Resource r WHERE " +
           "(:type IS NULL OR r.type = :type) AND " +
           "(:search IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(r.location) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Resource> searchResources(@Param("type") ResourceType type, @Param("search") String search);

    @Query("SELECT r FROM Resource r WHERE r.availability = true AND r.id NOT IN (" +
           "  SELECT b.resource.id FROM Booking b WHERE b.status IN ('CONFIRMED', 'PENDING') AND " +
           "  (b.startTime < :endTime AND b.endTime > :startTime)" +
           ")")
    List<Resource> findAvailableResourcesBetween(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );
}
