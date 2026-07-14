package com.meetingflow.repository;

import com.meetingflow.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Notification> findByUserIdAndReadOrderByCreatedAtDesc(Long userId, boolean read);
    long countByUserIdAndRead(Long userId, boolean read);
}
