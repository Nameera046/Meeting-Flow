package com.meetingflow.dto;

import java.time.LocalDate;

public class ActionItemDto {
    private Long id;
    private String description;
    private UserDto assignedTo;
    private LocalDate dueDate;
    private String status;

    public ActionItemDto() {}

    public ActionItemDto(Long id, String description, UserDto assignedTo, LocalDate dueDate, String status) {
        this.id = id;
        this.description = description;
        this.assignedTo = assignedTo;
        this.dueDate = dueDate;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public UserDto getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(UserDto assignedTo) {
        this.assignedTo = assignedTo;
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
}
