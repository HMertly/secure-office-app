package com.secureoffice.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public class UpdateStatusRequest {
    @NotBlank(message = "Statü boş olamaz")
    private String status;

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}