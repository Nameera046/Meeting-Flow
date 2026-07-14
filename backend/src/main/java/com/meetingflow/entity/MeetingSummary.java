package com.meetingflow.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "meeting_summaries")
public class MeetingSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id", nullable = false, unique = true)
    private Meeting meeting;

    @Column(name = "executive_summary", columnDefinition = "TEXT")
    private String executiveSummary;

    @Column(name = "key_discussion_points", columnDefinition = "TEXT")
    private String keyDiscussionPoints;

    @Column(name = "decisions_made", columnDefinition = "TEXT")
    private String decisionsMade;

    @Column(name = "risks_concerns", columnDefinition = "TEXT")
    private String risksConcerns;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public MeetingSummary() {}

    public MeetingSummary(Meeting meeting, String executiveSummary, String keyDiscussionPoints, String decisionsMade, String risksConcerns) {
        this.meeting = meeting;
        this.executiveSummary = executiveSummary;
        this.keyDiscussionPoints = keyDiscussionPoints;
        this.decisionsMade = decisionsMade;
        this.risksConcerns = risksConcerns;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Meeting getMeeting() {
        return meeting;
    }

    public void setMeeting(Meeting meeting) {
        this.meeting = meeting;
    }

    public String getExecutiveSummary() {
        return executiveSummary;
    }

    public void setExecutiveSummary(String executiveSummary) {
        this.executiveSummary = executiveSummary;
    }

    public String getKeyDiscussionPoints() {
        return keyDiscussionPoints;
    }

    public void setKeyDiscussionPoints(String keyDiscussionPoints) {
        this.keyDiscussionPoints = keyDiscussionPoints;
    }

    public String getDecisionsMade() {
        return decisionsMade;
    }

    public void setDecisionsMade(String decisionsMade) {
        this.decisionsMade = decisionsMade;
    }

    public String getRisksConcerns() {
        return risksConcerns;
    }

    public void setRisksConcerns(String risksConcerns) {
        this.risksConcerns = risksConcerns;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
