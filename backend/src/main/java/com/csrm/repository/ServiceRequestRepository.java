package com.csrm.repository;

import com.csrm.entity.ServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {
    List<ServiceRequest> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<ServiceRequest> findAllByOrderByCreatedAtDesc();
    void deleteByUserId(Long userId);
}
