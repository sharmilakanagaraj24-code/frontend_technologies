package com.jobportal.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(nullable = false, length = 150)
    private String company;

    @Column(nullable = false, length = 120)
    private String location;

    @Column(name = "work_location_type", nullable = false, length = 50)
    private String workLocationType;

    @Column(name = "employment_type", nullable = false, length = 50)
    private String employmentType;

    @Column(name = "experience_level", nullable = false, length = 50)
    private String experienceLevel;

    @Column(name = "min_experience_years")
    @Builder.Default
    private Integer minExperienceYears = 0;

    @Column(name = "salary_min", nullable = false)
    private Integer salaryMin;

    @Column(name = "salary_max", nullable = false)
    private Integer salaryMax;

    @Column(length = 10)
    @Builder.Default
    private String currency = "USD";

    @Column(length = 100)
    private String department;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(columnDefinition = "JSON")
    private String responsibilities;

    @Column(columnDefinition = "JSON")
    private String qualifications;

    @Column(name = "posted_date")
    private LocalDate postedDate;

    @Column(name = "deadline_date")
    private LocalDate deadlineDate;

    @Column(name = "applicants_count")
    @Builder.Default
    private Integer applicantsCount = 0;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
