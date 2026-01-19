package com.secureoffice.backend.tickets;

import com.secureoffice.backend.dto.request.CreateTicketRequest;
import com.secureoffice.backend.projects.Project;
import com.secureoffice.backend.projects.ProjectRepository;
import com.secureoffice.backend.users.User;
import com.secureoffice.backend.users.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class) // Mockito kütüphanesini başlatır
class TicketServiceTest {

    @Mock // Sahte Veritabanı Erişim Nesneleri
    private TicketRepository ticketRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks // Sahteleri TicketService'in içine yerleştir
    private TicketService ticketService;

    // --- TEST 1: Her şey yolunda giderse ---
    @Test
    void createTicket_ShouldCreateSuccessfully() {
        // --- GIVEN (Hazırlık) ---
        String userEmail = "test@user.com";

        // İstek (Request) nesnesi
        CreateTicketRequest request = new CreateTicketRequest();
        request.setTitle("Test Görevi");
        request.setDescription("Unit test yazıyoruz");
        request.setPriority("HIGH");
        request.setProjectId(1L);

        // Sahte Kullanıcı
        User mockUser = new User();
        mockUser.setId(99L);
        mockUser.setEmail(userEmail);

        // Sahte Proje
        Project mockProject = new Project();
        mockProject.setId(1L);

        // Mock Davranışları (Senaryo)
        when(userRepository.findByEmailIgnoreCase(userEmail)).thenReturn(Optional.of(mockUser));
        when(projectRepository.findById(1L)).thenReturn(Optional.of(mockProject));
        // Kayıt edilince, kaydedilen nesneyi geri dön (input -> output)
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // --- WHEN (Eylem) ---
        Ticket result = ticketService.createTicket(request, userEmail);

        // --- THEN (Kontrol) ---
        assertNotNull(result); // Sonuç boş olmamalı
        assertEquals("Test Görevi", result.getTitle()); // Başlık doğru mu?
        assertEquals(TicketPriority.HIGH, result.getPriority()); // String -> Enum dönüşümü doğru mu?
        assertEquals(mockUser, result.getCreatedBy()); // Oluşturan kişi doğru mu?

        // Veritabanına gerçekten 'save' metodu çağrıldı mı?
        verify(ticketRepository, times(1)).save(any(Ticket.class));
    }

    // --- TEST 2: Proje Bulunamazsa Hata Vermeli ---
    @Test
    void createTicket_ShouldThrowException_WhenProjectNotFound() {
        // --- GIVEN ---
        String userEmail = "test@user.com";
        CreateTicketRequest request = new CreateTicketRequest();
        request.setProjectId(999L); // OLMAYAN bir ID

        // Kullanıcı var (önce kullanıcıya bakıyor kod, o yüzden bunu bulması lazım)
        when(userRepository.findByEmailIgnoreCase(userEmail)).thenReturn(Optional.of(new User()));

        // AMA Proje yok (Empty dönüyoruz)
        when(projectRepository.findById(999L)).thenReturn(Optional.empty());

        // --- WHEN & THEN ---
        // Kodun hata fırlatmasını bekliyoruz
        assertThrows(ResponseStatusException.class, () -> {
            ticketService.createTicket(request, userEmail);
        });

        // Bu senaryoda ticketRepository.save() ASLA çağrılmamalı (çünkü hata alıp durmalı)
        verify(ticketRepository, never()).save(any());
    }
}