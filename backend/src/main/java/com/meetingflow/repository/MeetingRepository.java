package com.meetingflow.repository;

import com.meetingflow.entity.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {
    List<Meeting> findAllByOrderByDateDescTimeDesc();
    List<Meeting> findByDepartment(String department);
    
    @Query("SELECT m FROM Meeting m WHERE LOWER(m.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(m.description) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(m.agenda) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Meeting> searchMeetings(@Param("query") String query);
}
