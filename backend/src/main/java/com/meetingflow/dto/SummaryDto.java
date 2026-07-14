package com.meetingflow.dto;

public class SummaryDto {
    private Long id;
    private String executiveSummary;
    private String keyDiscussionPoints;
    private String decisionsMade;
    private String risksConcerns;

    public SummaryDto() {}

    public SummaryDto(Long id, String executiveSummary, String keyDiscussionPoints, String decisionsMade, String risksConcerns) {
        this.id = id;
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
}
