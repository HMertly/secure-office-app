package com.secureoffice.backend.tickets;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    // Bir göreve ait yorumları getir (Tarihe göre eskiden yeniye)
    List<Comment> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
}