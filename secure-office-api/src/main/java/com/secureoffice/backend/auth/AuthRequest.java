package com.secureoffice.backend.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class AuthRequest {

    @Email(message = "Geçerli bir e-posta giriniz")
    @NotBlank(message = "E-posta boş olamaz")
    private String email; // public -> private yaptık

    @NotBlank(message = "Şifre boş olamaz")
    private String password; // public -> private yaptık

    // --- Boş Constructor (Zorunlu) ---
    public AuthRequest() {
    }

    // --- Constructor ---
    public AuthRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }

    // --- GETTER METOTLARI (Hatanın Çözümü) ---
    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    // --- SETTER METOTLARI ---
    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}