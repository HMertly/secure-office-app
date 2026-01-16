package com.secureoffice.backend.tickets;

import com.secureoffice.backend.dto.request.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tickets")
public class TicketController {

    private final TicketService ticketService;

    // Artık Repository'leri değil, sadece Service'i çağırıyoruz
    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Ticket create(@Valid @RequestBody CreateTicketRequest req, Authentication auth) {
        return ticketService.createTicket(req, auth.getName());
    }

    @GetMapping("/project/{projectId}")
    public List<Ticket> getTicketsByProject(@PathVariable Long projectId) {
        return ticketService.getTicketsByProject(projectId);
    }

    @GetMapping
    public List<Ticket> listMine() {
        return ticketService.getAllTickets();
    }

    @GetMapping("/{id}")
    public Ticket getOne(@PathVariable Long id) {
        return ticketService.getTicketById(id);
    }

    @PutMapping("/{id}")
    public Ticket update(@PathVariable Long id, @RequestBody UpdateTicketRequest req, Authentication auth) {
        return ticketService.updateTicket(id, req, auth.getName());
    }

    @PatchMapping("/{id}/status")
    public Ticket updateStatus(@PathVariable Long id, @Valid @RequestBody UpdateStatusRequest req, Authentication auth) {
        return ticketService.updateStatus(id, req, auth.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication auth) {
        ticketService.deleteTicket(id, auth.getName());
    }

    @GetMapping("/{id}/comments")
    public List<Comment> getComments(@PathVariable Long id) {
        return ticketService.getComments(id);
    }

    @PostMapping("/{id}/comments")
    public Comment addComment(@PathVariable Long id, @RequestBody CreateCommentRequest req, Authentication auth) {
        return ticketService.addComment(id, req, auth.getName());
    }
}