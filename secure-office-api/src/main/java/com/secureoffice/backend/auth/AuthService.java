package com.secureoffice.backend.auth;

import com.secureoffice.backend.dto.request.AuthRequest;
import com.secureoffice.backend.dto.request.RegisterRequest;
import com.secureoffice.backend.dto.response.AuthResponse;
import com.secureoffice.backend.security.JwtService;
import com.secureoffice.backend.users.Role;
import com.secureoffice.backend.users.RoleRepository;
import com.secureoffice.backend.users.User;
import com.secureoffice.backend.users.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final String adminSecretKey;

    public AuthService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       @Value("${app.security.admin-secret-key}") String adminSecretKey) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.adminSecretKey = adminSecretKey;
    }

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.findByEmailIgnoreCase(req.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setEmail(req.getEmail());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword())); // Şifreyi Hashliyoruz!
        user.setFirstName(req.getFirstName());
        user.setLastName(req.getLastName());

        String targetRoleName = "ROLE_USER";
        if ("ADMIN".equals(req.getRole())) {
            if (req.getAdminKey() != null && req.getAdminKey().equals(adminSecretKey)) {
                targetRoleName = "ROLE_ADMIN";
            } else {
                throw new RuntimeException("Hatalı Admin Anahtarı!");
            }
        }

        // Değişkeni lambda içinde kullanabilmek için final (sabit) bir kopyasını oluşturuyoruz
        String finalRoleName = targetRoleName;

        Role userRole = roleRepository.findByName(finalRoleName)
                .orElseThrow(() -> new RuntimeException("ROL BULUNAMADI: " + finalRoleName + ". Lütfen veritabanına bu rolü ekleyin."));
        user.getRoles().add(userRole);
        userRepository.save(user);

        String token = jwtService.createAccessToken(user.getEmail());
        return new AuthResponse(token);
    }

    public AuthResponse login(AuthRequest req) {
        System.out.println("Login Denemesi -> Email: " + req.getEmail());

        User user = userRepository.findByEmailIgnoreCase(req.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Kullanıcı Bulunamadı"));

        // Şifre kontrolü
        boolean isMatch = passwordEncoder.matches(req.getPassword(), user.getPasswordHash());
        System.out.println("Şifre Eşleşti mi? : " + isMatch);

        if (!isMatch) {
            throw new IllegalArgumentException("Şifre Yanlış!");
        }

        String token = jwtService.createAccessToken(user.getEmail());
        return new AuthResponse(token);
    }
}