package com.csrm.controller;

import com.csrm.dto.ApiResponse;
import com.csrm.dto.BookingRequest;
import com.csrm.dto.BookingResponse;
import com.csrm.dto.ConflictCheckRequest;
import com.csrm.entity.Role;
import com.csrm.entity.User;
import com.csrm.service.AuthService;
import com.csrm.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final AuthService authService;

    public BookingController(BookingService bookingService, AuthService authService) {
        this.bookingService = bookingService;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(@Valid @RequestBody BookingRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        BookingResponse booking = bookingService.createBooking(request, user);
        return ResponseEntity.ok(ApiResponse.success("Reservation confirmed successfully", booking));
    }

    @PostMapping("/check-conflict")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkConflict(@Valid @RequestBody ConflictCheckRequest request) {
        boolean hasConflict = bookingService.checkConflict(
                request.getResourceId(),
                request.getStartTime(),
                request.getEndTime(),
                request.getExcludeBookingId()
        );
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "hasConflict", hasConflict,
                "message", hasConflict ? "A conflict exists in the requested time slot" : "Slot is available"
        )));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookings() {
        User user = authService.getCurrentAuthenticatedUser();
        if (user.getRole() == Role.ADMIN) {
            return ResponseEntity.ok(ApiResponse.success(bookingService.getAllBookings()));
        }
        return ResponseEntity.ok(ApiResponse.success(bookingService.getUserBookings(user.getId())));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyBookings() {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(ApiResponse.success(bookingService.getUserBookings(user.getId())));
    }

    @GetMapping("/resource/{resourceId}")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getResourceBookings(@PathVariable Long resourceId) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getResourceBookings(resourceId)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> modifyBooking(
            @PathVariable Long id,
            @Valid @RequestBody BookingRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        BookingResponse updated = bookingService.modifyBooking(id, request, user);
        return ResponseEntity.ok(ApiResponse.success("Booking modified successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        BookingResponse cancelled = bookingService.cancelBooking(id, user);
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully", cancelled));
    }
}
