package com.secureoffice.backend.tickets;

import com.secureoffice.backend.projects.Project;
import com.secureoffice.backend.projects.ProjectRepository; // EKLENDİ
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
@RequestMapping("/api/v1/tickets") // Not: Frontend'de URL'i buna göre güncelleyeceğiz (api/tickets mi api/v1/tickets mi dikkat et)
public class TicketController {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final ProjectRepository projectRepository; // YENİ EKLENDİ

    // Constructor Injection
    public TicketController(TicketRepository ticketRepository,
                            UserRepository userRepository,
                            CommentRepository commentRepository,
                            ProjectRepository projectRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
        this.projectRepository = projectRepository;
    }

    // --- DTOs ---
    public static class CreateTicketRequest {
        @NotBlank public String title;
        public String description;
        public String priority;
        public Long assignedToUserId;
        public Long projectId; // YENİ: Ticket hangi projeye ait?
    }

    public static class UpdateTicketRequest {
        public String title;
        public String description;
        public String priority;
        public Long assignedToUserId;
    }

    public static class UpdateStatusRequest {
        @NotBlank public String status;
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

    // 1. Create (Projeye Bağlı Ticket Oluşturma)
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Ticket create(@Valid @RequestBody CreateTicketRequest req, Authentication auth) {
        User currentUser = me(auth);

        Ticket t = new Ticket();
        t.setTitle(req.title);
        t.setDescription(req.description);
        t.setStatus(TicketStatus.OPEN);
        t.setCreatedBy(currentUser);

        // ATAMA MANTIĞI
        if (req.assignedToUserId != null) {
            User assignee = userRepository.findById(req.assignedToUserId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assignee not found"));
            t.setAssignedTo(assignee);
        } else {
            t.setAssignedTo(currentUser);
        }

        // ÖNCELİK
        if (req.priority != null && !req.priority.isBlank()) {
            t.setPriority(TicketPriority.valueOf(req.priority.toUpperCase()));
        } else {
            t.setPriority(TicketPriority.MEDIUM);
        }

        // YENİ: PROJE BAĞLAMA MANTIĞI
        if (req.projectId != null) {
            Project p = projectRepository.findById(req.projectId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Proje bulunamadı"));
            t.setProject(p);
        } else {
            // İstersek burada hata fırlatabiliriz: "Her ticket bir projeye ait olmalı!"
            // Şimdilik boş geçilirse null kalsın diyorsan böyle bırak.
        }

        return ticketRepository.save(t);
    }

    // 2. YENİ: Sadece Belirli Bir Projenin Ticketlarını Getir
    @GetMapping("/project/{projectId}")
    public List<Ticket> getTicketsByProject(@PathVariable Long projectId) {
        // İlerde buraya "Kullanıcı bu projeyi görmeye yetkili mi?" kontrolü eklenebilir.
        return ticketRepository.findByProjectId(projectId);
    }

    // 3. List Mine (Genel Liste - İstersen kaldırabilirsin, artık proje bazlı gidiyoruz)
    @GetMapping
    public List<Ticket> listMine(Authentication auth) {
        return ticketRepository.findAll();
    }

    // 4. Get by id
    @GetMapping("/{id}")
    public Ticket getOne(@PathVariable Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));
    }

    // 5. Update Details
    @PutMapping("/{id}")
    public Ticket update(@PathVariable Long id, @RequestBody UpdateTicketRequest req, Authentication auth) {
        User currentUser = me(auth);
        Ticket t = ticketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN"));
        boolean isCreator = t.getCreatedBy().getId().equals(currentUser.getId());
        boolean isAssignee = t.getAssignedTo() != null && t.getAssignedTo().getId().equals(currentUser.getId());

        if (!isAdmin && !isCreator && !isAssignee) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bunu düzenleme yetkiniz yok.");
        }

        if (req.title != null && !req.title.isBlank()) t.setTitle(req.title);
        if (req.description != null) t.setDescription(req.description);
        if (req.priority != null) {
            t.setPriority(TicketPriority.valueOf(req.priority.toUpperCase()));
        }

        if (req.assignedToUserId != null) {
            Long currentAssigneeId = (t.getAssignedTo() != null) ? t.getAssignedTo().getId() : null;
            if (!req.assignedToUserId.equals(currentAssigneeId)) {
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

    // 6. Update Status
    @PatchMapping("/{id}/status")
    public Ticket updateStatus(@PathVariable Long id, @Valid @RequestBody UpdateStatusRequest req, Authentication auth) {
        User currentUser = me(auth);
        Ticket t = ticketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

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

    // 7. Delete
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

    // 8. Get Comments
    @GetMapping("/{id}/comments")
    public List<Comment> getComments(@PathVariable Long id) {
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(id);
    }

    // 9. Add Comment
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