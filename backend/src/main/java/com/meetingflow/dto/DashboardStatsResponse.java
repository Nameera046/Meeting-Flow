package com.meetingflow.dto;

import java.util.List;
import java.util.Map;

public class DashboardStatsResponse {
    private long totalMeetings;
    private long pendingTasks;
    private long inProgressTasks;
    private long completedTasks;
    private long blockedTasks;
    private double taskCompletionRate;
    private List<MeetingResponse> recentMeetings;
    private List<MeetingResponse> upcomingMeetings;
    private Map<String, Long> taskStatusBreakdown;
    private Map<String, Long> tasksAssignedPerUser; // Used for "Team Productivity" chart

    public DashboardStatsResponse() {}

    public long getTotalMeetings() {
        return totalMeetings;
    }

    public void setTotalMeetings(long totalMeetings) {
        this.totalMeetings = totalMeetings;
    }

    public long getPendingTasks() {
        return pendingTasks;
    }

    public void setPendingTasks(long pendingTasks) {
        this.pendingTasks = pendingTasks;
    }

    public long getInProgressTasks() {
        return inProgressTasks;
    }

    public void setInProgressTasks(long inProgressTasks) {
        this.inProgressTasks = inProgressTasks;
    }

    public long getCompletedTasks() {
        return completedTasks;
    }

    public void setCompletedTasks(long completedTasks) {
        this.completedTasks = completedTasks;
    }

    public long getBlockedTasks() {
        return blockedTasks;
    }

    public void setBlockedTasks(long blockedTasks) {
        this.blockedTasks = blockedTasks;
    }

    public double getTaskCompletionRate() {
        return taskCompletionRate;
    }

    public void setTaskCompletionRate(double taskCompletionRate) {
        this.taskCompletionRate = taskCompletionRate;
    }

    public List<MeetingResponse> getRecentMeetings() {
        return recentMeetings;
    }

    public void setRecentMeetings(List<MeetingResponse> recentMeetings) {
        this.recentMeetings = recentMeetings;
    }

    public List<MeetingResponse> getUpcomingMeetings() {
        return upcomingMeetings;
    }

    public void setUpcomingMeetings(List<MeetingResponse> upcomingMeetings) {
        this.upcomingMeetings = upcomingMeetings;
    }

    public Map<String, Long> getTaskStatusBreakdown() {
        return taskStatusBreakdown;
    }

    public void setTaskStatusBreakdown(Map<String, Long> taskStatusBreakdown) {
        this.taskStatusBreakdown = taskStatusBreakdown;
    }

    public Map<String, Long> getTasksAssignedPerUser() {
        return tasksAssignedPerUser;
    }

    public void setTasksAssignedPerUser(Map<String, Long> tasksAssignedPerUser) {
        this.tasksAssignedPerUser = tasksAssignedPerUser;
    }
}
