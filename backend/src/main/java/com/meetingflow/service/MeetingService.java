package com.meetingflow.service;

import com.meetingflow.dto.*;
import com.meetingflow.entity.*;
import com.meetingflow.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final MeetingSummaryRepository meetingSummaryRepository;
    private final ActionItemRepository actionItemRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final MeetingAnalysisService analysisService;
    private final TaskService taskService;
    private final NotificationService notificationService;

    public MeetingService(MeetingRepository meetingRepository, MeetingSummaryRepository meetingSummaryRepository,
                          ActionItemRepository actionItemRepository, UserRepository userRepository,
                          UserService userService, MeetingAnalysisService analysisService,
                          TaskService taskService, NotificationService notificationService) {
        this.meetingRepository = meetingRepository;
        this.meetingSummaryRepository = meetingSummaryRepository;
        this.actionItemRepository = actionItemRepository;
        this.userRepository = userRepository;
        this.userService = userService;
        this.analysisService = analysisService;
        this.taskService = taskService;
        this.notificationService = notificationService;
    }

    @Transactional
    public MeetingResponse createMeeting(MeetingRequest request) {
        User creator = userService.getCurrentUserEntity();
        Meeting meeting = new Meeting();
        meeting.setTitle(request.getTitle());
        meeting.setDescription(request.getDescription());
        meeting.setDate(request.getDate());
        meeting.setTime(request.getTime());
        meeting.setDepartment(request.getDepartment());
        meeting.setAgenda(request.getAgenda());
        meeting.setStatus("SCHEDULED");
        meeting.setCreatedBy(creator);

        Set<User> participants = new HashSet<>();
        if (request.getParticipantIds() != null && !request.getParticipantIds().isEmpty()) {
            for (Long pId : request.getParticipantIds()) {
                userRepository.findById(pId).ifPresent(user -> {
                    participants.add(user);
                    // Send notification to participants
                    notificationService.createNotification(
                            user,
                            "New Meeting Scheduled",
                            "You have been added to the meeting \"" + meeting.getTitle() + "\" on " + 
                            meeting.getDate() + " at " + meeting.getTime() + ".",
                            "MEETING_CREATED"
                    );
                });
            }
        }
        meeting.setParticipants(participants);

        Meeting saved = meetingRepository.save(meeting);
        return mapToResponse(saved);
    }

    @Transactional
    public MeetingResponse uploadTranscript(Long meetingId, String transcript) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found."));

        meeting.setTranscript(transcript);
        meeting.setStatus("COMPLETED");
        Meeting savedMeeting = meetingRepository.save(meeting);

        // Process AI Analysis
        MeetingAnalysisService.AnalysisResult analysis = analysisService.analyzeTranscript(transcript, meeting.getTitle());

        // Save Summary
        MeetingSummary summary = meetingSummaryRepository.findByMeetingId(meetingId)
                .orElse(new MeetingSummary());
        summary.setMeeting(savedMeeting);
        summary.setExecutiveSummary(analysis.getExecutiveSummary());
        summary.setKeyDiscussionPoints(analysis.getKeyDiscussionPoints());
        summary.setDecisionsMade(analysis.getDecisionsMade());
        summary.setRisksConcerns(analysis.getRisksConcerns());
        meetingSummaryRepository.save(summary);

        // Save Action Items and Convert to Tasks
        List<ActionItem> actionItems = new ArrayList<>();
        for (MeetingAnalysisService.ActionItemDetail itemDetail : analysis.getActionItems()) {
            ActionItem item = new ActionItem(
                    savedMeeting,
                    itemDetail.getDescription(),
                    itemDetail.getAssignee(),
                    itemDetail.getDueDate()
            );
            item.setStatus("CONVERTED"); // Automatically converted
            ActionItem savedItem = actionItemRepository.save(item);
            actionItems.add(savedItem);

            // Convert to Task automatically
            TaskRequest taskRequest = new TaskRequest();
            taskRequest.setName(itemDetail.getDescription().substring(0, Math.min(itemDetail.getDescription().length(), 80)));
            taskRequest.setDescription("Action item from meeting: " + savedMeeting.getTitle() + "\n\nOriginal Action item: " + itemDetail.getDescription());
            taskRequest.setAssigneeId(itemDetail.getAssignee() != null ? itemDetail.getAssignee().getId() : null);
            taskRequest.setPriority("MEDIUM");
            taskRequest.setDueDate(itemDetail.getDueDate());
            taskRequest.setStatus("PENDING");
            taskRequest.setActionItemId(savedItem.getId());
            taskService.createTask(taskRequest);
        }

        return mapToResponse(savedMeeting);
    }

    @Transactional(readOnly = true)
    public List<MeetingResponse> getAllMeetings(String department) {
        List<Meeting> meetings = department != null ?
                meetingRepository.findByDepartment(department) :
                meetingRepository.findAllByOrderByDateDescTimeDesc();

        return meetings.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MeetingResponse getMeetingById(Long id) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meeting not found."));
        return mapToResponse(meeting);
    }

    @Transactional
    public void deleteMeeting(Long id) {
        if (!meetingRepository.existsById(id)) {
            throw new RuntimeException("Meeting not found.");
        }
        meetingRepository.deleteById(id);
    }

    public MeetingResponse mapToResponse(Meeting m) {
        MeetingResponse r = new MeetingResponse();
        r.setId(m.getId());
        r.setTitle(m.getTitle());
        r.setDescription(m.getDescription());
        r.setDate(m.getDate());
        r.setTime(m.getTime());
        r.setDepartment(m.getDepartment());
        r.setAgenda(m.getAgenda());
        r.setStatus(m.getStatus());
        r.setTranscript(m.getTranscript());

        if (m.getCreatedBy() != null) {
            r.setCreatedBy(new UserDto(
                    m.getCreatedBy().getId(),
                    m.getCreatedBy().getUsername(),
                    m.getCreatedBy().getFullName(),
                    m.getCreatedBy().getEmail()
            ));
        }

        r.setParticipants(m.getParticipants().stream()
                .map(p -> new UserDto(p.getId(), p.getUsername(), p.getFullName(), p.getEmail()))
                .collect(Collectors.toList()));

        meetingSummaryRepository.findByMeetingId(m.getId()).ifPresent(summary -> {
            r.setSummary(new SummaryDto(
                    summary.getId(),
                    summary.getExecutiveSummary(),
                    summary.getKeyDiscussionPoints(),
                    summary.getDecisionsMade(),
                    summary.getRisksConcerns()
            ));
        });

        r.setActionItems(actionItemRepository.findByMeetingId(m.getId()).stream()
                .map(item -> new ActionItemDto(
                        item.getId(),
                        item.getDescription(),
                        item.getAssignedTo() != null ? new UserDto(item.getAssignedTo().getId(), item.getAssignedTo().getUsername(), item.getAssignedTo().getFullName(), item.getAssignedTo().getEmail()) : null,
                        item.getDueDate(),
                        item.getStatus()
                ))
                .collect(Collectors.toList()));

        return r;
    }
}
