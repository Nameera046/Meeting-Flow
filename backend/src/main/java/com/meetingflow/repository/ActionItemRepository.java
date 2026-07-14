package com.meetingflow.repository;

import com.meetingflow.entity.ActionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ActionItemRepository extends JpaRepository<ActionItem, Long> {
    List<ActionItem> findByMeetingId(Long meetingId);
    List<ActionItem> findByAssignedToId(Long userId);
}
