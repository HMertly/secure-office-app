package com.secureoffice.backend.users;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 1. Mevcut metodun: Tüm kullanıcıları getir
    @GetMapping
    public List<User> listAll() {
        return userRepository.findAll();
    }

    // --- YENİ EKLENEN KISIM: KULLANICI SİLME ---
    // Sadece ROLE_ADMIN yetkisi olanlar bu adrese istek atabilir.
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, org.springframework.security.core.Authentication authentication) {
        User userToDelete = userRepository.findById(id).orElse(null);
        if(userToDelete == null){
            return ResponseEntity.notFound().build();
        }
        String currentPrincipalName = authentication.getName();
        if(userToDelete.getEmail().equals(currentPrincipalName)){
            return ResponseEntity.badRequest().body("Kendi hesabınızı silemezsiniz.");
        }


        // Varsa siliyoruz
        userRepository.deleteById(id);

        // Başarılı (204 No Content) dönüyoruz
        return ResponseEntity.noContent().build();
    }
}