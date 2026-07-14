package com.meetingflow.dto;

import java.time.LocalDate;

public class TaskRequest {
    private String name;
    private String description;
    private Long assigneeId;
    private String priority; // LOW, MEDIUM, HIGH
    private LocalDate dueDate;
    private String status; // PENDING, IN_PROGRESS, COMPLETED, BLOCKED
    private Long actionItemId; // Link if converted from action item

    public TaskRequest() {}

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getAssigneeId() {
        return assigneeId;
    }

    public void setAssigneeId(Long assigneeId) {
        this.assigneeId = assigneeId;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getActionItemId() {
        return actionItemId;
    }

    public void setActionItemId(Long actionItemId) {
        this.actionItemId = actionItemId;
    }
}
