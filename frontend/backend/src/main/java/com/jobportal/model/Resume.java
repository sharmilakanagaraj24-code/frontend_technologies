package com.jobportal.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "resumes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resume {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "user_id", nullable = false, length = 64)
    private String userId;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(name = "template_id", length = 50)
    @Builder.Default
    private String templateId = "modern";

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(nullable = false, length = 191)
    private String email;

    @Column(length = 40)
    private String phone;

    @Column(length = 120)
    private String location;

    @Column(length = 150)
    private String headline;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "skills_json", columnDefinition = "JSON")
    private String skillsJson;

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
