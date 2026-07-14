package com.meetingflow.controller;

import com.meetingflow.dto.MeetingRequest;
import com.meetingflow.dto.MeetingResponse;
import com.meetingflow.service.MeetingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/meetings")
public class MeetingController {

    private final MeetingService meetingService;

    public MeetingController(MeetingService meetingService) {
        this.meetingService = meetingService;
    }

    @PostMapping
    public ResponseEntity<MeetingResponse> createMeeting(@RequestBody MeetingRequest request) {
        MeetingResponse response = meetingService.createMeeting(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<MeetingResponse>> getAllMeetings(@RequestParam(required = false) String department) {
        List<MeetingResponse> response = meetingService.getAllMeetings(department);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MeetingResponse> getMeetingById(@PathVariable Long id) {
        MeetingResponse response = meetingService.getMeetingById(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/transcript")
    public ResponseEntity<MeetingResponse> uploadTranscript(
            @PathVariable Long id, 
            @RequestBody Map<String, String> payload) {
        String transcript = payload.get("transcript");
        MeetingResponse response = meetingService.uploadTranscript(id, transcript);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMeeting(@PathVariable Long id) {
        try {
            meetingService.deleteMeeting(id);
            return ResponseEntity.ok("Meeting deleted successfully.");
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}
