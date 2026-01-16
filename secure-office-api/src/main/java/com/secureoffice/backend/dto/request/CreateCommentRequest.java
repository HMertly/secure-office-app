package com.secureoffice.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public class CreateCommentRequest {
    @NotBlank(message = "Yorum metni boş olamaz")
    private String text;

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
}