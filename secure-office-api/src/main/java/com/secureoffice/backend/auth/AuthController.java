package com.secureoffice.backend.auth;

import com.secureoffice.backend.dto.request.AuthRequest;
import com.secureoffice.backend.dto.request.RegisterRequest;
import com.secureoffice.backend.dto.response.AuthResponse;
import com.secureoffice.backend.dto.response.User_Response;
import com.secureoffice.backend.users.User;
import com.secureoffice.backend.users.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    // GÜVENLİK GÜNCELLEMESİ: Artık User entity değil, UserResponse dönüyoruz.
    @GetMapping("/me")
    public ResponseEntity<User_Response> getMe(Authentication authentication) {
        User user = userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Entity -> DTO Dönüşümü (Mapper)
        User_Response response = new User_Response();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());

        // Rolleri String listesine çevir
        response.setRoles(user.getRoles().stream()
                .map(role -> role.getName())
                .collect(Collectors.toSet()));

        return ResponseEntity.ok(response);
    }
}