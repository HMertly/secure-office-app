package com.secureoffice.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public class CreateTicketRequest {
    @NotBlank(message = "Başlık boş olamaz")
    private String title;

    private String description;
    private String priority;
    private Long assignedToUserId;
    private Long projectId;

    // Getter & Setter (Lombok @Data varsa gerek yok, yoksa ekle)
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public Long getAssignedToUserId() { return assignedToUserId; }
    public void setAssignedToUserId(Long assignedToUserId) { this.assignedToUserId = assignedToUserId; }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
}