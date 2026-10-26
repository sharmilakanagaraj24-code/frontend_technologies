package com.jobportal.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "job_applications",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"user_id", "job_id"})}
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobApplication {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "job_id", nullable = false, length = 64)
    private String jobId;

    @Column(name = "user_id", nullable = false, length = 64)
    private String userId;

    @Column(name = "resume_id", nullable = false, length = 64)
    private String resumeId;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "Applied";

    @Column(name = "applied_date", nullable = false)
    private LocalDate appliedDate;

    @Column(name = "cover_note", columnDefinition = "TEXT")
    private String coverNote;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
