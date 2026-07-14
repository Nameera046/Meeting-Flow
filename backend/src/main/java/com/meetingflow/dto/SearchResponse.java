package com.meetingflow.dto;

import java.util.List;

public class SearchResponse {
    private List<MeetingResponse> meetings;
    private List<TaskResponse> tasks;
    private List<ActionItemDto> actionItems;
    private List<String> decisions;

    public SearchResponse() {}

    public SearchResponse(List<MeetingResponse> meetings, List<TaskResponse> tasks, List<ActionItemDto> actionItems, List<String> decisions) {
        this.meetings = meetings;
        this.tasks = tasks;
        this.actionItems = actionItems;
        this.decisions = decisions;
    }

    public List<MeetingResponse> getMeetings() {
        return meetings;
    }

    public void setMeetings(List<MeetingResponse> meetings) {
        this.meetings = meetings;
    }

    public List<TaskResponse> getTasks() {
        return tasks;
    }

    public void setTasks(List<TaskResponse> tasks) {
        this.tasks = tasks;
    }

    public List<ActionItemDto> getActionItems() {
        return actionItems;
    }

    public void setActionItems(List<ActionItemDto> actionItems) {
        this.actionItems = actionItems;
    }

    public List<String> getDecisions() {
        return decisions;
    }

    public void setDecisions(List<String> decisions) {
        this.decisions = decisions;
    }
}
