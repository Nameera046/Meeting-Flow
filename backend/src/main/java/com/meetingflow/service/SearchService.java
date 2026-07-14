package com.meetingflow.service;

import com.meetingflow.dto.ActionItemDto;
import com.meetingflow.dto.MeetingResponse;
import com.meetingflow.dto.SearchResponse;
import com.meetingflow.dto.TaskResponse;
import com.meetingflow.entity.ActionItem;
import com.meetingflow.entity.Meeting;
import com.meetingflow.entity.MeetingSummary;
import com.meetingflow.entity.Task;
import com.meetingflow.repository.ActionItemRepository;
import com.meetingflow.repository.MeetingRepository;
import com.meetingflow.repository.MeetingSummaryRepository;
import com.meetingflow.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SearchService {

    private final MeetingRepository meetingRepository;
    private final TaskRepository taskRepository;
    private final MeetingSummaryRepository meetingSummaryRepository;
    private final ActionItemRepository actionItemRepository;
    private final MeetingService meetingService;
    private final TaskService taskService;

    public SearchService(MeetingRepository meetingRepository, TaskRepository taskRepository,
                         MeetingSummaryRepository meetingSummaryRepository, ActionItemRepository actionItemRepository,
                         MeetingService meetingService, TaskService taskService) {
        this.meetingRepository = meetingRepository;
        this.taskRepository = taskRepository;
        this.meetingSummaryRepository = meetingSummaryRepository;
        this.actionItemRepository = actionItemRepository;
        this.meetingService = meetingService;
        this.taskService = taskService;
    }

    @Transactional(readOnly = true)
    public SearchResponse globalSearch(String query) {
        if (query == null || query.trim().isEmpty()) {
            return new SearchResponse(new ArrayList<>(), new ArrayList<>(), new ArrayList<>(), new ArrayList<>());
        }

        String lowercaseQuery = query.toLowerCase();

        // 1. Search Meetings
        List<MeetingResponse> meetings = meetingRepository.searchMeetings(query).stream()
                .map(meetingService::mapToResponse)
                .collect(Collectors.toList());

        // 2. Search Tasks
        List<TaskResponse> tasks = taskRepository.searchTasks(query).stream()
                .map(taskService::mapToResponse)
                .collect(Collectors.toList());

        // 3. Search Action Items
        List<ActionItemDto> actionItems = actionItemRepository.findAll().stream()
                .filter(item -> item.getDescription().toLowerCase().contains(lowercaseQuery))
                .map(item -> meetingService.mapToResponse(item.getMeeting()).getActionItems().stream()
                        .filter(dto -> dto.getId().equals(item.getId())).findFirst().orElse(null))
                .filter(dto -> dto != null)
                .collect(Collectors.toList());

        // 4. Search Decisions from Summaries
        List<String> decisions = new ArrayList<>();
        List<MeetingSummary> summaries = meetingSummaryRepository.findAll();
        for (MeetingSummary summary : summaries) {
            String decisionsText = summary.getDecisionsMade();
            if (decisionsText != null) {
                String[] items = decisionsText.split("\\n");
                for (String item : items) {
                    if (item.toLowerCase().contains(lowercaseQuery)) {
                        decisions.add(item.replace("- ", "").trim() + " (From meeting: " + summary.getMeeting().getTitle() + ")");
                    }
                }
            }
        }

        return new SearchResponse(meetings, tasks, actionItems, decisions);
    }
}
