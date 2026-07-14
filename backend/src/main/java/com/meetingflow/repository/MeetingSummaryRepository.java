package com.meetingflow.repository;

import com.meetingflow.entity.MeetingSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface MeetingSummaryRepository extends JpaRepository<MeetingSummary, Long> {
    Optional<MeetingSummary> findByMeetingId(Long meetingId);
}
