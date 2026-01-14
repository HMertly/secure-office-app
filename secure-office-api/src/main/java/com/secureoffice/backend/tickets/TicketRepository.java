package com.secureoffice.backend.tickets;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    @Query("""
    select t from Ticket t
    where lower(t.createdBy.email) = lower(:email)
       or (t.assignedTo is not null and lower(t.assignedTo.email) = lower(:email))
    order by t.createdAt desc
  """)
    List<Ticket> findVisibleForUserEmail(@Param("email") String email);
}
