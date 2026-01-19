package com.secureoffice.backend.tickets;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.secureoffice.backend.dto.request.CreateTicketRequest;
import com.secureoffice.backend.projects.Project;
import com.secureoffice.backend.projects.ProjectRepository;
import com.secureoffice.backend.users.Role;
import com.secureoffice.backend.users.RoleRepository;
import com.secureoffice.backend.users.User;
import com.secureoffice.backend.users.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest // 1. Tüm uygulamayı (Database, Security, Service) ayağa kaldırır.
@AutoConfigureMockMvc // 2. Bize sanal bir "Postman" (MockMvc) verir.
@Transactional // 3. ÇOK ÖNEMLİ: Test bitince veritabanına yazdıklarını geri alır (Siler).
class TicketControllerTest {

    @Autowired
    private MockMvc mockMvc; // İstek atacak arkadaş

    @Autowired
    private ObjectMapper objectMapper; // Java nesnesini JSON'a çeviren arkadaş

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Long testProjectId;

    @BeforeEach
    void setUp() {
        // Her testten önce veritabanında gerçek bir ortam hazırlayalım

        // 1. Rolleri kontrol et, yoksa ekle (Hata almamak için)
        if (roleRepository.findByName("ROLE_USER").isEmpty()) {
            Role r = new Role();
            r.setName("ROLE_USER");
            roleRepository.save(r);
        }

        // 2. Bir kullanıcı oluştur (Ticket'ı oluşturacak kişi)
        if (userRepository.findByEmailIgnoreCase("test@user.com").isEmpty()) {
            User user = new User();
            user.setEmail("test@user.com");
            user.setFirstName("Test");
            user.setLastName("User");
            user.setPasswordHash(passwordEncoder.encode("123456"));
            // Rol ataması
            Role roleUser = roleRepository.findByName("ROLE_USER").get();
            user.setRoles(new HashSet<>());
            user.getRoles().add(roleUser);
            userRepository.save(user);
        }

        // 3. Bir proje oluştur (Ticket buna bağlanacak)
        Project project = new Project();
        project.setName("Integration Test Projesi");
        project.setDescription("Bu proje test sırasında oluşturuldu");
        Project savedProject = projectRepository.save(project);
        testProjectId = savedProject.getId();
    }

    @Test
    @WithMockUser(username = "test@user.com", roles = "USER") // 4. Sanki giriş yapmış gibi davran!
    void createTicket_ShouldReturn201_WhenRequestIsValid() throws Exception {
        // --- GIVEN (Hazırlık) ---
        CreateTicketRequest request = new CreateTicketRequest();
        request.setTitle("Entegrasyon Görevi");
        request.setDescription("Controller -> Service -> DB yolunu test ediyoruz");
        request.setPriority("HIGH");
        request.setProjectId(testProjectId); // Az önce oluşturduğumuz gerçek proje ID'si

        // --- WHEN (Eylem) ---
        // POST isteği atıyoruz: /api/v1/tickets
        mockMvc.perform(post("/api/v1/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))) // JSON'a çevirip yolluyoruz

                // --- THEN (Kontrol) ---
                .andExpect(status().isCreated()) // HTTP 201 bekliyoruz
                .andExpect(jsonPath("$.id").exists()) // Dönen cevapta ID var mı?
                .andExpect(jsonPath("$.title").value("Entegrasyon Görevi")) // Başlık doğru mu?
                .andExpect(jsonPath("$.priority").value("HIGH")); // Öncelik doğru mu?
    }

    @Test
    void createTicket_ShouldReturn401_WhenUserNotLoggedIn() throws Exception {
        // Bu testte @WithMockUser YOK. Yani giriş yapmadık.

        CreateTicketRequest request = new CreateTicketRequest();
        request.setTitle("Hacker Görevi");

        mockMvc.perform(post("/api/v1/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized()); // HTTP 401 (Yetkisiz) bekliyoruz
    }
}