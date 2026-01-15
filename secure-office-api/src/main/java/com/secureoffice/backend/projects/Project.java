package com.secureoffice.backend.projects;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.secureoffice.backend.tickets.Ticket;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // Örn: "Mobil Uygulama", "Web Sitesi"

    private String description; // Örn: "React ile yapılacak site"

    // Bir projenin BİRDEN ÇOK görevi olabilir (OneToMany)
    // "mappedBy = project" -> Ticket sınıfındaki 'project' değişkeni bu işi yönetir diyoruz.
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore // Projeyi çekerken içindeki 1000 tane görevi de getirmesin diye bunu koyuyoruz (Performans)
    private List<Ticket> tickets;

    @CreationTimestamp
    private LocalDateTime createdAt;
}