package com.jobportal.controller;

import com.jobportal.model.Job;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "*")
public class JobController {

    // Mock/in-memory store fallback for standalone testing if MySQL is offline
    private static final List<Job> mockJobs = new ArrayList<>();

    @GetMapping
    public ResponseEntity<List<Job>> getJobs(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String workType,
            @RequestParam(required = false) String experienceLevel
    ) {
        return ResponseEntity.ok(mockJobs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Job> getJobById(@PathVariable String id) {
        return mockJobs.stream()
                .filter(j -> j.getId().equals(id))
                .findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Job> createJob(@RequestBody Job job) {
        if (job.getId() == null) {
            job.setId("job-" + UUID.randomUUID());
        }
        mockJobs.add(job);
        return ResponseEntity.ok(job);
    }
}
