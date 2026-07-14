package com.meetingflow.service;

import com.meetingflow.entity.User;
import com.meetingflow.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class MeetingAnalysisService {

    private static final Logger logger = LoggerFactory.getLogger(MeetingAnalysisService.class);

    private final UserRepository userRepository;

    @Value("${meetingflow.ai.mock-enabled:true}")
    private boolean mockEnabled;

    public MeetingAnalysisService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public static class ActionItemDetail {
        private String description;
        private User assignee;
        private LocalDate dueDate;

        public ActionItemDetail(String description, User assignee, LocalDate dueDate) {
            this.description = description;
            this.assignee = assignee;
            this.dueDate = dueDate;
        }

        public String getDescription() { return description; }
        public User getAssignee() { return assignee; }
        public LocalDate getDueDate() { return dueDate; }
    }

    public static class AnalysisResult {
        private String executiveSummary;
        private String keyDiscussionPoints;
        private String decisionsMade;
        private String risksConcerns;
        private List<ActionItemDetail> actionItems = new ArrayList<>();

        public AnalysisResult() {}

        public String getExecutiveSummary() { return executiveSummary; }
        public void setExecutiveSummary(String executiveSummary) { this.executiveSummary = executiveSummary; }
        public String getKeyDiscussionPoints() { return keyDiscussionPoints; }
        public void setKeyDiscussionPoints(String keyDiscussionPoints) { this.keyDiscussionPoints = keyDiscussionPoints; }
        public String getDecisionsMade() { return decisionsMade; }
        public void setDecisionsMade(String decisionsMade) { this.decisionsMade = decisionsMade; }
        public String getRisksConcerns() { return risksConcerns; }
        public void setRisksConcerns(String risksConcerns) { this.risksConcerns = risksConcerns; }
        public List<ActionItemDetail> getActionItems() { return actionItems; }
        public void setActionItems(List<ActionItemDetail> actionItems) { this.actionItems = actionItems; }
    }

    public AnalysisResult analyzeTranscript(String transcript, String title) {
        logger.info("Analyzing transcript for meeting: {}", title);
        
        AnalysisResult result = new AnalysisResult();
        
        if (transcript == null || transcript.trim().isEmpty()) {
            result.setExecutiveSummary("No transcript provided for analysis.");
            result.setKeyDiscussionPoints("N/A");
            result.setDecisionsMade("N/A");
            result.setRisksConcerns("N/A");
            return result;
        }

        // Perform Rule-Based Keyword/Regex NLP Analysis (simulates LLM)
        List<String> discussionPoints = new ArrayList<>();
        List<String> decisions = new ArrayList<>();
        List<String> risks = new ArrayList<>();
        List<ActionItemDetail> actionItems = new ArrayList<>();

        // 1. Process speakers and segment text (sanitize escapes and outer quotes)
        String cleanedTranscript = transcript;
        if (cleanedTranscript.startsWith("\"") && cleanedTranscript.endsWith("\"")) {
            cleanedTranscript = cleanedTranscript.substring(1, cleanedTranscript.length() - 1);
        }
        cleanedTranscript = cleanedTranscript.replace("\\r\\n", "\n").replace("\\n", "\n").replace("\\r", "\n");
        
        String[] lines = cleanedTranscript.split("\n");
        List<User> users = userRepository.findAll();

        for (String line : lines) {
            String lowercaseLine = line.toLowerCase();
            
            // Check for speakers, e.g., "Sarah Jenkins: Let's do this"
            User speaker = null;
            String text = line;
            if (line.contains(":")) {
                int colonIndex = line.indexOf(":");
                String speakerName = line.substring(0, colonIndex).trim();
                text = line.substring(colonIndex + 1).trim();
                
                // Find matching user by full name or username
                for (User u : users) {
                    if (u.getFullName().equalsIgnoreCase(speakerName) || 
                        u.getUsername().equalsIgnoreCase(speakerName) || 
                        speakerName.toLowerCase().contains(u.getUsername().toLowerCase())) {
                        speaker = u;
                        break;
                    }
                }
            }

            // A. Detect Discussion Points (general statement)
            if (lowercaseLine.contains("discuss") || lowercaseLine.contains("introduce") || lowercaseLine.contains("outline") || lowercaseLine.contains("review")) {
                discussionPoints.add(text);
            }

            // B. Detect Decisions Made
            if (lowercaseLine.contains("decide") || lowercaseLine.contains("agree") || lowercaseLine.contains("finalize") || lowercaseLine.contains("set up")) {
                decisions.add(text);
            }

            // C. Detect Risks/Concerns
            if (lowercaseLine.contains("concern") || lowercaseLine.contains("risk") || lowercaseLine.contains("worry") || lowercaseLine.contains("blocker") || lowercaseLine.contains("challenge")) {
                risks.add(text);
            }

            // D. Detect Action Items & Assignees
            // Pattern 1: "[User] will [action]" or "[User] to [action]"
            // Pattern 2: "needs to [action]" or "responsible for [action]"
            boolean actionDetected = false;
            String actionDesc = "";
            User assignedTo = speaker; // Default to speaker if they said it about themselves

            // Check if another user is mentioned in this line
            for (User u : users) {
                if (lowercaseLine.contains(u.getFullName().toLowerCase()) || lowercaseLine.contains(u.getUsername().toLowerCase())) {
                    assignedTo = u;
                    break;
                }
            }

            if (lowercaseLine.contains("should") || lowercaseLine.contains("will") || lowercaseLine.contains("needs to") || lowercaseLine.contains("assign") || lowercaseLine.contains("task")) {
                // Clean description
                actionDesc = text;
                actionDetected = true;
            }

            if (actionDetected && !actionDesc.trim().isEmpty() && actionDesc.length() > 10) {
                // Determine a realistic due date (e.g. 7 days from now)
                LocalDate dueDate = LocalDate.now().plusDays(7);
                actionItems.add(new ActionItemDetail(actionDesc, assignedTo, dueDate));
            }
        }

        // 2. Generate Fallbacks if regex didn't extract enough structured details
        if (discussionPoints.isEmpty()) {
            discussionPoints.add("Discussed project kickoff structure and timelines.");
            discussionPoints.add("Reviewed current roadmap and individual assignments.");
        }
        if (decisions.isEmpty()) {
            decisions.add("Finalized primary architecture design and core modules.");
        }
        if (risks.isEmpty()) {
            risks.add("Strict deadline for building front-end views and back-end controllers.");
        }
        if (actionItems.isEmpty()) {
            // Add a mock action item assigned to the first user found or system admin
            User defaultUser = users.isEmpty() ? null : users.get(0);
            actionItems.add(new ActionItemDetail("Complete initial project roadmap and sync task statuses", defaultUser, LocalDate.now().plusDays(5)));
        }

        // 3. Format outputs as markdown lists
        StringBuilder dpBuilder = new StringBuilder();
        discussionPoints.stream().distinct().limit(5).forEach(dp -> dpBuilder.append("- ").append(dp).append("\n"));
        result.setKeyDiscussionPoints(dpBuilder.toString());

        StringBuilder decBuilder = new StringBuilder();
        decisions.stream().distinct().limit(5).forEach(dec -> decBuilder.append("- ").append(dec).append("\n"));
        result.setDecisionsMade(decBuilder.toString());

        StringBuilder riskBuilder = new StringBuilder();
        risks.stream().distinct().limit(5).forEach(risk -> riskBuilder.append("- ").append(risk).append("\n"));
        result.setRisksConcerns(riskBuilder.toString());

        // 4. Draft Executive Summary
        String execSummary = "The meeting titled '" + title + "' was conducted to address alignment, architecture, and task scheduling. Key topics discussed included " + 
                             (discussionPoints.isEmpty() ? "general project updates" : discussionPoints.get(0).toLowerCase()) + ". " +
                             "The team successfully reached alignment on " + (decisions.isEmpty() ? "immediate priorities" : decisions.get(0).toLowerCase()) + 
                             " and designated specific actions to move forward. The primary milestone is targeted for completion in the upcoming sprint.";
        result.setExecutiveSummary(execSummary);
        result.setActionItems(actionItems);

        return result;
    }
}
