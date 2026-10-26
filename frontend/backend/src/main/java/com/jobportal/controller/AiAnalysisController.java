package com.jobportal.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiAnalysisController {

    private final RestTemplate restTemplate;

    @Value("${ml-service.url:http://localhost:5000}")
    private String mlServiceUrl;

    public AiAnalysisController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @PostMapping("/predict-fit")
    public ResponseEntity<?> predictFit(@RequestBody Map<String, Object> payload) {
        try {
            String targetUrl = mlServiceUrl + "/api/predict-fit";
            ResponseEntity<Map> response = restTemplate.postForEntity(targetUrl, payload, Map.class);
            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to communicate with Python AI/ML microservice: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/recommendations")
    public ResponseEntity<?> getRecommendations(@RequestBody Map<String, Object> payload) {
        try {
            String targetUrl = mlServiceUrl + "/api/recommendations";
            ResponseEntity<Map> response = restTemplate.postForEntity(targetUrl, payload, Map.class);
            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "ML Recommendation service error: " + e.getMessage()
            ));
        }
    }
}
