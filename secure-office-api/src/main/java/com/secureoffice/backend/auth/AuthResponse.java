package com.secureoffice.backend.auth;

public class AuthResponse {
    public String accessToken;

    public AuthResponse(String accessToken) {
        this.accessToken = accessToken;
    }
}
