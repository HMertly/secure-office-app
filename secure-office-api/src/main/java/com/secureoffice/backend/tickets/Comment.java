package com.secureoffice.backend.tickets;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.secureoffice.backend.users.User;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    @CreationTimestamp
    private LocalDateTime createdAt; // Otomatik tarih atar

    // Hangi Kullanıcı Yazdı?
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User createdBy;

    // Hangi Göreve Yazıldı?
    @ManyToOne
    @JoinColumn(name = "ticket_id", nullable = false)
    @JsonIgnore // Sonsuz döngü olmasın diye ticket detayını JSON'a koymuyoruz
    private Ticket ticket;

    // --- Getter & Setter ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }

    public Ticket getTicket() { return ticket; }
    public void setTicket(Ticket ticket) { this.ticket = ticket; }
}