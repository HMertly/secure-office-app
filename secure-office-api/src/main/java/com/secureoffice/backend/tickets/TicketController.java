package com.secureoffice.backend.tickets;

import com.secureoffice.backend.users.User;
import com.secureoffice.backend.users.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tickets")
public class TicketController {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository; // DÜZELTİLDİ (Yazım Hatası)

    public TicketController(TicketRepository ticketRepository, UserRepository userRepository, CommentRepository commentRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository; // DÜZELTİLDİ
    }

    // --- DTOs ---
    public static class CreateTicketRequest {
        @NotBlank public String title;
        public String description;
        public String priority;
        public Long assignedToUserId;
    }

    public static class UpdateTicketRequest {
        public String title;
        public String description;
        public String priority;
        public Long assignedToUserId;
    }

    public static class UpdateStatusRequest {
        @NotBlank public String status; // OPEN / IN_PROGRESS / DONE
    }

    public static class CreateCommentRequest {
        @NotBlank public String text;
    }


    // --- Helpers ---
    private User me(Authentication auth) {
        return userRepository.findByEmailIgnoreCase(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    // --- Endpoints ---

    // Create
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Ticket create(@Valid @RequestBody CreateTicketRequest req, Authentication auth) {
        User currentUser = me(auth);

        Ticket t = new Ticket();
        t.setTitle(req.title);
        t.setDescription(req.description);
        t.setStatus(TicketStatus.OPEN);
        t.setCreatedBy(currentUser);

        // --- ATAMA MANTIĞI ---
        if (req.assignedToUserId != null) {
            User assignee = userRepository.findById(req.assignedToUserId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assignee not found"));
            t.setAssignedTo(assignee);
        } else {
            t.setAssignedTo(currentUser); // Varsayılan kendine ata
        }
        // ---------------------

        if (req.priority != null && !req.priority.isBlank()) {
            t.setPriority(TicketPriority.valueOf(req.priority.toUpperCase()));
        } else {
            t.setPriority(TicketPriority.MEDIUM);
        }

        return ticketRepository.save(t);
    }

    // List
    @GetMapping
    public List<Ticket> listMine(Authentication auth) {
        // İleride buraya Admin ise findAll yap diyebiliriz ama şimdilik herkes görebiliyor.
        return ticketRepository.findAll();
    }

    // Get by id
    @GetMapping("/{id}")
    public Ticket getOne(@PathVariable Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));
    }

    // Update (Başlık/Açıklama)
    @PutMapping("/{id}")
    public Ticket update(@PathVariable Long id, @RequestBody UpdateTicketRequest req, Authentication auth) {
        User currentUser = me(auth);
        Ticket t = ticketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

        // ROL KONTROLLERİ
        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN"));
        boolean isCreator = t.getCreatedBy().getId().equals(currentUser.getId());
        // YENİ: Görev bu kişiye mi atanmış?
        boolean isAssignee = t.getAssignedTo() != null && t.getAssignedTo().getId().equals(currentUser.getId());

        // Ana Yetki Kontrolü: Admin DEĞİLSE, Oluşturan DEĞİLSE ve Atanan Kişi DEĞİLSE -> Yasak
        if (!isAdmin && !isCreator && !isAssignee) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bunu düzenleme yetkiniz yok.");
        }

        // --- GÜNCELLEMELER ---

        // Başlık, Açıklama ve Önceliği hepsi değiştirebilir
        if (req.title != null && !req.title.isBlank()) t.setTitle(req.title);
        if (req.description != null) t.setDescription(req.description);
        if (req.priority != null) {
            t.setPriority(TicketPriority.valueOf(req.priority.toUpperCase()));
        }

        // --- ATAMA KISITLAMASI ---
        if (req.assignedToUserId != null) {
            Long currentAssigneeId = (t.getAssignedTo() != null) ? t.getAssignedTo().getId() : null;

            // Eğer atanan kişi değişiyorsa:
            if (!req.assignedToUserId.equals(currentAssigneeId)) {

                // Admin veya Oluşturan değilse -> BAŞKASINA ATAYAMAZ!
                if (!isAdmin && !isCreator) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Görevi başkasına devretme yetkiniz yok.");
                }

                User assignee = userRepository.findById(req.assignedToUserId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found"));
                t.setAssignedTo(assignee);
            }
        }

        return ticketRepository.save(t);
    }

    // --- GÜNCELLENEN METOD: Update status (Sürükle Bırak) ---
    @PatchMapping("/{id}/status")
    public Ticket updateStatus(@PathVariable Long id,
                               @Valid @RequestBody UpdateStatusRequest req,
                               Authentication auth) {
        User currentUser = me(auth);
        Ticket t = ticketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

        // YETKİ KONTROLÜ
        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN"));
        boolean isCreator = t.getCreatedBy().getId().equals(currentUser.getId());
        boolean isAssignee = t.getAssignedTo() != null && t.getAssignedTo().getId().equals(currentUser.getId());

        if (!isAdmin && !isCreator && !isAssignee) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bu görevi taşıma yetkiniz yok.");
        }

        try {
            t.setStatus(TicketStatus.valueOf(req.status.trim().toUpperCase()));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status");
        }

        return ticketRepository.save(t);
    }

    // --- GÜNCELLENEN METOD: Delete ---
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication auth) {
        User currentUser = me(auth);
        Ticket t = ticketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN"));
        boolean isCreator = t.getCreatedBy().getId().equals(currentUser.getId());

        if (!isAdmin && !isCreator) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bu görevi silme yetkiniz yok.");
        }

        ticketRepository.delete(t);
    }

    // 1. Yorumları Getir
    @GetMapping("/{id}/comments")
    public List<Comment> getComments(@PathVariable Long id) {
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(id);
    }

    // 2. Yorum Ekle
    @PostMapping("/{id}/comments")
    public Comment addComment(@PathVariable Long id, @RequestBody CreateCommentRequest req, Authentication auth) {
        User currentUser = me(auth);
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

        Comment comment = new Comment();
        comment.setText(req.text);
        comment.setTicket(ticket);
        comment.setCreatedBy(currentUser);

        return commentRepository.save(comment);
    }

}