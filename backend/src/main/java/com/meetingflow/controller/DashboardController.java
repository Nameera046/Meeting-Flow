package com.meetingflow.controller;

import com.meetingflow.dto.DashboardStatsResponse;
import com.meetingflow.dto.MeetingResponse;
import com.meetingflow.entity.Meeting;
import com.meetingflow.entity.Task;
import com.meetingflow.repository.MeetingRepository;
import com.meetingflow.repository.TaskRepository;
import com.meetingflow.service.MeetingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final MeetingRepository meetingRepository;
    private final TaskRepository taskRepository;
    private final MeetingService meetingService;

    public DashboardController(MeetingRepository meetingRepository, TaskRepository taskRepository, MeetingService meetingService) {
        this.meetingRepository = meetingRepository;
        this.taskRepository = taskRepository;
        this.meetingService = meetingService;
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getStats() {
        DashboardStatsResponse stats = new DashboardStatsResponse();

        // 1. Meeting counts
        long totalMeetings = meetingRepository.count();
        stats.setTotalMeetings(totalMeetings);

        // 2. Task counts
        long pending = taskRepository.countByStatus("PENDING");
        long inProgress = taskRepository.countByStatus("IN_PROGRESS");
        long completed = taskRepository.countByStatus("COMPLETED");
        long blocked = taskRepository.countByStatus("BLOCKED");

        stats.setPendingTasks(pending);
        stats.setInProgressTasks(inProgress);
        stats.setCompletedTasks(completed);
        stats.setBlockedTasks(blocked);

        // 3. Completion Rate
        long totalTasks = pending + inProgress + completed + blocked;
        double completionRate = totalTasks > 0 ? ((double) completed / totalTasks) * 100 : 0.0;
        stats.setTaskCompletionRate(completionRate);

        // 4. Recent and Upcoming Meetings
        List<Meeting> allMeetings = meetingRepository.findAllByOrderByDateDescTimeDesc();
        LocalDate today = LocalDate.now();

        List<MeetingResponse> recent = allMeetings.stream()
                .filter(m -> m.getDate().isBefore(today) || m.getDate().isEqual(today))
                .limit(5)
                .map(meetingService::mapToResponse)
                .collect(Collectors.toList());

        List<MeetingResponse> upcoming = allMeetings.stream()
                .filter(m -> m.getDate().isAfter(today))
                .limit(5)
                .map(meetingService::mapToResponse)
                .collect(Collectors.toList());

        stats.setRecentMeetings(recent);
        stats.setUpcomingMeetings(upcoming);

        // 5. Task Status Breakdown
        Map<String, Long> statusMap = new HashMap<>();
        statusMap.put("PENDING", pending);
        statusMap.put("IN_PROGRESS", inProgress);
        statusMap.put("COMPLETED", completed);
        statusMap.put("BLOCKED", blocked);
        stats.setTaskStatusBreakdown(statusMap);

        // 6. Tasks Assigned Per User (Productivity Chart)
        Map<String, Long> userTasksMap = new HashMap<>();
        List<Task> tasks = taskRepository.findAll();
        for (Task t : tasks) {
            if (t.getAssignee() != null) {
                String userName = t.getAssignee().getFullName();
                userTasksMap.put(userName, userTasksMap.getOrDefault(userName, 0L) + 1);
            }
        }
        stats.setTasksAssignedPerUser(userTasksMap);

        return ResponseEntity.ok(stats);
    }
}
