package com.csrm.service;

import com.csrm.dto.BookingRequest;
import com.csrm.dto.BookingResponse;
import com.csrm.entity.*;
import com.csrm.exception.BadRequestException;
import com.csrm.exception.BookingConflictException;
import com.csrm.exception.ResourceNotFoundException;
import com.csrm.repository.BookingRepository;
import com.csrm.repository.ResourceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm");

    public BookingService(BookingRepository bookingRepository,
                          ResourceRepository resourceRepository,
                          AuditLogService auditLogService,
                          NotificationService notificationService) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .sorted((a, b) -> b.getStartTime().compareTo(a.getStartTime()))
                .map(BookingResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getUserBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByStartTimeDesc(userId)
                .stream()
                .map(BookingResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getResourceBookings(Long resourceId) {
        return bookingRepository.findByResourceIdOrderByStartTimeDesc(resourceId)
                .stream()
                .map(BookingResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean checkConflict(Long resourceId, LocalDateTime startTime, LocalDateTime endTime, Long excludeBookingId) {
        if (startTime.isAfter(endTime) || startTime.isEqual(endTime)) {
            throw new BadRequestException("Start time must be before end time");
        }
        List<Booking> conflicts = bookingRepository.findOverlappingBookings(resourceId, startTime, endTime, excludeBookingId);
        return !conflicts.isEmpty();
    }

    @Transactional
    public BookingResponse createBooking(BookingRequest request, User user) {
        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().isEqual(request.getEndTime())) {
            throw new BadRequestException("Start time must be before end time");
        }

        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + request.getResourceId()));

        if (!Boolean.TRUE.equals(resource.getAvailability())) {
            throw new BadRequestException("Resource '" + resource.getName() + "' is currently unavailable for booking");
        }

        // Conflict check
        List<Booking> conflicts = bookingRepository.findOverlappingBookings(
                resource.getId(), request.getStartTime(), request.getEndTime(), null
        );

        if (!conflicts.isEmpty()) {
            Booking conflict = conflicts.get(0);
            throw new BookingConflictException(String.format(
                    "Booking conflict: '%s' is already reserved from %s to %s",
                    resource.getName(),
                    conflict.getStartTime().format(FORMATTER),
                    conflict.getEndTime().format(FORMATTER)
            ));
        }

        Booking booking = new Booking(
                user,
                resource,
                request.getStartTime(),
                request.getEndTime(),
                BookingStatus.CONFIRMED,
                request.getPurpose(),
                request.getNotes()
        );

        Booking saved = bookingRepository.save(booking);

        // Audit Log
        auditLogService.log(
                user.getId(),
                user.getUsername(),
                "BOOKING_CREATED",
                "Booking",
                saved.getId(),
                String.format("Booked '%s' from %s to %s for purpose: %s",
                        resource.getName(),
                        saved.getStartTime().format(FORMATTER),
                        saved.getEndTime().format(FORMATTER),
                        saved.getPurpose())
        );

        // Notification & simulated alerts (Confirmation & Reminders)
        String title = "Booking Confirmed: " + resource.getName();
        String message = String.format("Hello %s, your reservation for '%s' (%s) is confirmed from %s to %s. A calendar reminder has been scheduled.",
                user.getFullName(),
                resource.getName(),
                resource.getLocation(),
                saved.getStartTime().format(FORMATTER),
                saved.getEndTime().format(FORMATTER)
        );
        notificationService.sendNotification(user, title, message, "ALL");

        return new BookingResponse(saved);
    }

    @Transactional
    public BookingResponse modifyBooking(Long bookingId, BookingRequest request, User currentUser) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        // Only the owner or an ADMIN can modify
        if (!booking.getUser().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ADMIN) {
            throw new BadRequestException("You are not authorized to modify this booking");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Cannot modify a cancelled booking");
        }

        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().isEqual(request.getEndTime())) {
            throw new BadRequestException("Start time must be before end time");
        }

        // Conflict check excluding current booking
        List<Booking> conflicts = bookingRepository.findOverlappingBookings(
                request.getResourceId() != null ? request.getResourceId() : booking.getResource().getId(),
                request.getStartTime(),
                request.getEndTime(),
                booking.getId()
        );

        if (!conflicts.isEmpty()) {
            Booking conflict = conflicts.get(0);
            throw new BookingConflictException(String.format(
                    "Booking conflict: Selected time overlaps with an existing reservation from %s to %s",
                    conflict.getStartTime().format(FORMATTER),
                    conflict.getEndTime().format(FORMATTER)
            ));
        }

        if (request.getResourceId() != null && !request.getResourceId().equals(booking.getResource().getId())) {
            Resource newResource = resourceRepository.findById(request.getResourceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));
            booking.setResource(newResource);
        }

        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        if (request.getPurpose() != null) booking.setPurpose(request.getPurpose());
        if (request.getNotes() != null) booking.setNotes(request.getNotes());

        Booking updated = bookingRepository.save(booking);

        // Audit Log
        auditLogService.log(
                currentUser.getId(),
                currentUser.getUsername(),
                "BOOKING_MODIFIED",
                "Booking",
                updated.getId(),
                String.format("Modified booking for '%s' new window: %s to %s",
                        updated.getResource().getName(),
                        updated.getStartTime().format(FORMATTER),
                        updated.getEndTime().format(FORMATTER))
        );

        // Notification
        notificationService.sendNotification(
                booking.getUser(),
                "Booking Modified: " + updated.getResource().getName(),
                String.format("Your reservation was updated: %s to %s at %s.",
                        updated.getStartTime().format(FORMATTER),
                        updated.getEndTime().format(FORMATTER),
                        updated.getResource().getLocation()),
                "EMAIL"
        );

        return new BookingResponse(updated);
    }

    @Transactional
    public BookingResponse cancelBooking(Long bookingId, User currentUser) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        if (!booking.getUser().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ADMIN) {
            throw new BadRequestException("You are not authorized to cancel this booking");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);

        // Audit Log
        auditLogService.log(
                currentUser.getId(),
                currentUser.getUsername(),
                "BOOKING_CANCELLED",
                "Booking",
                saved.getId(),
                String.format("Cancelled booking for '%s' scheduled on %s",
                        saved.getResource().getName(),
                        saved.getStartTime().format(FORMATTER))
        );

        // Notification
        notificationService.sendNotification(
                booking.getUser(),
                "Booking Cancelled: " + saved.getResource().getName(),
                String.format("Your reservation for '%s' scheduled for %s has been cancelled.",
                        saved.getResource().getName(),
                        saved.getStartTime().format(FORMATTER)),
                "EMAIL"
        );

        return new BookingResponse(saved);
    }
}
