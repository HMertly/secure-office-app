package com.secureoffice.backend.tickets;

import com.secureoffice.backend.dto.request.*;
import com.secureoffice.backend.projects.Project;
import com.secureoffice.backend.projects.ProjectRepository;
import com.secureoffice.backend.users.User;
import com.secureoffice.backend.users.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final CommentRepository commentRepository;

    public TicketService(TicketRepository ticketRepository,
                         UserRepository userRepository,
                         ProjectRepository projectRepository,
                         CommentRepository commentRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.commentRepository = commentRepository;
    }

    // --- YARDIMCI METODLAR ---
    private User getUserByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Kullanıcı bulunamadı"));
    }

    private Ticket getTicketOrThrow(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Görev bulunamadı"));
    }

    private boolean isAdmin(User user) {
        return user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN"));
    }

    // --- İŞ MANTIĞI (BUSINESS LOGIC) ---

    public Ticket createTicket(CreateTicketRequest req, String userEmail) {
        User currentUser = getUserByEmail(userEmail);

        Ticket t = new Ticket();
        t.setTitle(req.getTitle());
        t.setDescription(req.getDescription());
        t.setStatus(TicketStatus.OPEN);
        t.setCreatedBy(currentUser);

        // Atama Mantığı
        if (req.getAssignedToUserId() != null) {
            User assignee = userRepository.findById(req.getAssignedToUserId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Atanacak kullanıcı bulunamadı"));
            t.setAssignedTo(assignee);
        } else {
            t.setAssignedTo(currentUser);
        }

        // Öncelik Mantığı
        if (req.getPriority() != null && !req.getPriority().isBlank()) {
            try {
                t.setPriority(TicketPriority.valueOf(req.getPriority().toUpperCase()));
            } catch (IllegalArgumentException e) {
                t.setPriority(TicketPriority.MEDIUM);
            }
        } else {
            t.setPriority(TicketPriority.MEDIUM);
        }

        // Proje Bağlama
        if (req.getProjectId() != null) {
            Project p = projectRepository.findById(req.getProjectId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Proje bulunamadı"));
            t.setProject(p);
        }

        return ticketRepository.save(t);
    }

    public List<Ticket> getTicketsByProject(Long projectId) {
        return ticketRepository.findByProjectId(projectId);
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public Ticket getTicketById(Long id) {
        return getTicketOrThrow(id);
    }

    public Ticket updateTicket(Long id, UpdateTicketRequest req, String userEmail) {
        User currentUser = getUserByEmail(userEmail);
        Ticket t = getTicketOrThrow(id);

        // Yetki Kontrolü
        boolean isCreator = t.getCreatedBy().getId().equals(currentUser.getId());
        boolean isAssignee = t.getAssignedTo() != null && t.getAssignedTo().getId().equals(currentUser.getId());

        if (!isAdmin(currentUser) && !isCreator && !isAssignee) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bu görevi düzenleme yetkiniz yok.");
        }

        // Güncellemeler
        if (req.getTitle() != null && !req.getTitle().isBlank()) t.setTitle(req.getTitle());
        if (req.getDescription() != null) t.setDescription(req.getDescription());
        if (req.getPriority() != null) {
            try {
                t.setPriority(TicketPriority.valueOf(req.getPriority().toUpperCase()));
            } catch (Exception ignored) {}
        }

        // Atama Değişikliği (Sadece Admin veya Oluşturan yapabilir)
        if (req.getAssignedToUserId() != null) {
            Long currentAssigneeId = (t.getAssignedTo() != null) ? t.getAssignedTo().getId() : null;

            if (!req.getAssignedToUserId().equals(currentAssigneeId)) {
                if (!isAdmin(currentUser) && !isCreator) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Görevi başkasına devretme yetkiniz yok.");
                }
                User newAssignee = userRepository.findById(req.getAssignedToUserId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kullanıcı bulunamadı"));
                t.setAssignedTo(newAssignee);
            }
        }
        return ticketRepository.save(t);
    }

    public Ticket updateStatus(Long id, UpdateStatusRequest req, String userEmail) {
        User currentUser = getUserByEmail(userEmail);
        Ticket t = getTicketOrThrow(id);

        boolean isCreator = t.getCreatedBy().getId().equals(currentUser.getId());
        boolean isAssignee = t.getAssignedTo() != null && t.getAssignedTo().getId().equals(currentUser.getId());

        if (!isAdmin(currentUser) && !isCreator && !isAssignee) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bu görevi taşıma yetkiniz yok.");
        }

        try {
            t.setStatus(TicketStatus.valueOf(req.getStatus().trim().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz durum (status)");
        }
        return ticketRepository.save(t);
    }

    public void deleteTicket(Long id, String userEmail) {
        User currentUser = getUserByEmail(userEmail);
        Ticket t = getTicketOrThrow(id);

        boolean isCreator = t.getCreatedBy().getId().equals(currentUser.getId());

        if (!isAdmin(currentUser) && !isCreator) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bu görevi silme yetkiniz yok.");
        }
        ticketRepository.delete(t);
    }

    public Comment addComment(Long ticketId, CreateCommentRequest req, String userEmail) {
        User currentUser = getUserByEmail(userEmail);
        Ticket ticket = getTicketOrThrow(ticketId);

        Comment comment = new Comment();
        comment.setText(req.getText());
        comment.setTicket(ticket);
        comment.setCreatedBy(currentUser);
        return commentRepository.save(comment);
    }

    public List<Comment> getComments(Long ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }
}