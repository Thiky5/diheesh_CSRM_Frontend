package com.csrm.service;

import com.csrm.entity.*;
import com.csrm.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;
    private final AuditLogRepository auditLogRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           ResourceRepository resourceRepository,
                           BookingRepository bookingRepository,
                           AuditLogRepository auditLogRepository,
                           NotificationRepository notificationRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.resourceRepository = resourceRepository;
        this.bookingRepository = bookingRepository;
        this.auditLogRepository = auditLogRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            logger.info("Initializing CSRM default campus users and resources...");

            // 1. Seed Users
            User admin = new User(
                    "admin",
                    passwordEncoder.encode("admin123"),
                    "Dr. Eleanor Vance (Dean of Facilities)",
                    "admin@campus.edu",
                    Role.ADMIN,
                    UserStatus.APPROVED
            );
            userRepository.save(admin);

            User faculty = new User(
                    "faculty",
                    passwordEncoder.encode("faculty123"),
                    "Prof. Robert Oppenheim",
                    "faculty@campus.edu",
                    Role.FACULTY,
                    UserStatus.APPROVED
            );
            userRepository.save(faculty);

            User student = new User(
                    "student",
                    passwordEncoder.encode("student123"),
                    "Alex Rivera",
                    "student@campus.edu",
                    Role.STUDENT,
                    UserStatus.APPROVED
            );
            userRepository.save(student);

            User pendingStudent = new User(
                    "sarah_connor",
                    passwordEncoder.encode("password123"),
                    "Sarah Connor",
                    "sarah.c@campus.edu",
                    Role.STUDENT,
                    UserStatus.PENDING
            );
            userRepository.save(pendingStudent);

            User pendingFaculty = new User(
                    "dr_clark",
                    passwordEncoder.encode("password123"),
                    "Dr. Arthur Clark",
                    "clark.a@campus.edu",
                    Role.FACULTY,
                    UserStatus.PENDING
            );
            userRepository.save(pendingFaculty);

            // 2. Seed Resources
            Resource r1 = new Resource("Auditorium Hall A (Tech Amphitheater)", ResourceType.CLASSROOM, "Main Academic Block, Floor 1", true, 250, "Full multimedia theater with 4K laser projection, immersive sound, and dual podiums.", 45.0);
            Resource r2 = new Resource("Advanced Robotics & AI Lab", ResourceType.LAB, "Turing Engineering Wing 302", true, 35, "Equipped with ROS workcells, GPU compute stations, 3D printers, and soldering rigs.", 30.0);
            Resource r3 = new Resource("Secure Smart Locker #B-104", ResourceType.LOCKER, "Student Center Central Atrium", true, 1, "RFID and digital PIN enabled locker with internal 65W USB-C charging station.", 5.0);
            Resource r4 = new Resource("Sony Cinema FX6 4K Camera Kit", ResourceType.EQUIPMENT, "Media Center AV Depository", true, 1, "Professional broadcast grade cine camera with G-Master prime lens trio and wireless lavaliers.", 15.0);
            Resource r5 = new Resource("Collaborative Seminar Room 204", ResourceType.CLASSROOM, "Science & Research Quad", true, 60, "Interactive smart touchscreens, ergonomic modular furniture, and teleconferencing.", 20.0);
            Resource r6 = new Resource("Biotechnology Genomics Lab", ResourceType.LAB, "Bio-Sciences Tower 4th Floor", true, 25, "Contains PCR thermocyclers, laminar flow hoods, and centrifuge stations.", 50.0);
            Resource r7 = new Resource("DJI Matrice 350 RTK Campus Survey Drone", ResourceType.EQUIPMENT, "Aeronautics Hangar B", true, 1, "Industrial thermal inspection drone kit with dual controllers and RTK base.", 60.0);
            Resource r8 = new Resource("Secure Smart Locker #C-209", ResourceType.LOCKER, "Library East Wing Ground Floor", true, 1, "Weatherproof, keypad access locker ideal for overnight lab gear storage.", 5.0);

            resourceRepository.saveAll(List.of(r1, r2, r3, r4, r5, r6, r7, r8));

            // 3. Seed Sample Bookings
            LocalDateTime now = LocalDateTime.now();
            Booking b1 = new Booking(faculty, r1, now.plusHours(2), now.plusHours(4), BookingStatus.CONFIRMED, "Guest Lecture on Quantum Computing", "Require dual lapel microphones.");
            Booking b2 = new Booking(student, r2, now.plusDays(1).withHour(10).withMinute(0), now.plusDays(1).withHour(12).withMinute(0), BookingStatus.CONFIRMED, "Robotics Competition Prototype Assembly", "Needs access to 3D printer #2.");
            Booking b3 = new Booking(student, r3, now.plusDays(2).withHour(9).withMinute(0), now.plusDays(2).withHour(17).withMinute(0), BookingStatus.CONFIRMED, "Daily Personal Gear & Laptop Storage", "PIN requested via SMS.");
            Booking b4 = new Booking(faculty, r4, now.plusDays(3).withHour(14).withMinute(0), now.plusDays(3).withHour(18).withMinute(0), BookingStatus.CONFIRMED, "Faculty Research Documentary Filming", "Tripod and backup batteries included.");

            bookingRepository.saveAll(List.of(b1, b2, b3, b4));

            // 4. Seed Audit Logs
            AuditLog a1 = new AuditLog(admin.getId(), admin.getUsername(), "SYSTEM_INIT", "System", 0L, "CSRM System initialized with base master data");
            AuditLog a2 = new AuditLog(faculty.getId(), faculty.getUsername(), "BOOKING_CREATED", "Booking", b1.getId(), "Reserved Auditorium Hall A for lecture");
            AuditLog a3 = new AuditLog(student.getId(), student.getUsername(), "BOOKING_CREATED", "Booking", b2.getId(), "Reserved Robotics & AI Lab for competition work");
            auditLogRepository.saveAll(List.of(a1, a2, a3));

            // 5. Seed Notifications
            Notification n1 = new Notification(faculty, "Booking Confirmed: Auditorium Hall A", "Your reservation from " + b1.getStartTime() + " to " + b1.getEndTime() + " is confirmed.", "ALL");
            Notification n2 = new Notification(student, "Booking Confirmed: Robotics Lab", "Your reservation for tomorrow 10:00 AM is active.", "EMAIL");
            notificationRepository.saveAll(List.of(n1, n2));

            logger.info("CSRM initialization finished successfully. Admin: admin/admin123, Faculty: faculty/faculty123, Student: student/student123");
        }
    }
}
