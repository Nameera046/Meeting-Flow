package com.meetingflow.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class MeetingResponse {
    private Long id;
    private String title;
    private String description;
    private LocalDate date;
    private LocalTime time;
    private String department;
    private String agenda;
    private String status;
    private String transcript;
    private UserDto createdBy;
    private List<UserDto> participants;
    private SummaryDto summary;
    private List<ActionItemDto> actionItems;

    public MeetingResponse() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public LocalTime getTime() {
        return time;
    }

    public void setTime(LocalTime time) {
        this.time = time;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getAgenda() {
        return agenda;
    }

    public void setAgenda(String agenda) {
        this.agenda = agenda;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTranscript() {
        return transcript;
    }

    public void setTranscript(String transcript) {
        this.transcript = transcript;
    }

    public UserDto getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(UserDto createdBy) {
        this.createdBy = createdBy;
    }

    public List<UserDto> getParticipants() {
        return participants;
    }

    public void setParticipants(List<UserDto> participants) {
        this.participants = participants;
    }

    public SummaryDto getSummary() {
        return summary;
    }

    public void setSummary(SummaryDto summary) {
        this.summary = summary;
    }

    public List<ActionItemDto> getActionItems() {
        return actionItems;
    }

    public void setActionItems(List<ActionItemDto> actionItems) {
        this.actionItems = actionItems;
    }
}
