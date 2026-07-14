package com.meetingflow.controller;

import com.meetingflow.dto.NotificationResponse;
import com.meetingflow.entity.User;
import com.meetingflow.service.NotificationService;
import com.meetingflow.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    public NotificationController(NotificationService notificationService, UserService userService) {
        this.notificationService = notificationService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications() {
        User user = userService.getCurrentUserEntity();
        List<NotificationResponse> response = notificationService.getNotificationsForUser(user.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications() {
        User user = userService.getCurrentUserEntity();
        List<NotificationResponse> response = notificationService.getUnreadNotificationsForUser(user.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount() {
        User user = userService.getCurrentUserEntity();
        return ResponseEntity.ok(notificationService.getUnreadCount(user.getId()));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        try {
            User user = userService.getCurrentUserEntity();
            notificationService.markAsRead(id, user.getId());
            return ResponseEntity.ok("Notification marked as read.");
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead() {
        User user = userService.getCurrentUserEntity();
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok("All notifications marked as read.");
    }
}
