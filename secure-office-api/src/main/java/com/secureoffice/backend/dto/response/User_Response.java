package com.secureoffice.backend.dto.response;

import java.util.Set;

public class User_Response {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private Set<String> roles; // Rol isimlerini String listesi olarak döneceğiz

    // Getter & Setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public Set<String> getRoles() { return roles; }
    public void setRoles(Set<String> roles) { this.roles = roles; }
}