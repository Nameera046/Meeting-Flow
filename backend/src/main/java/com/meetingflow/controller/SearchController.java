package com.meetingflow.controller;

import com.meetingflow.dto.SearchResponse;
import com.meetingflow.service.SearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping
    public ResponseEntity<SearchResponse> globalSearch(@RequestParam String q) {
        SearchResponse response = searchService.globalSearch(q);
        return ResponseEntity.ok(response);
    }
}
