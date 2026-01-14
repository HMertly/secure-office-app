package com.secureoffice.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        final String auth = request.getHeader(HttpHeaders.AUTHORIZATION);

        // Header yoksa veya Bearer ile başlamıyorsa zincire devam et
        if (auth == null || !auth.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            final String token = auth.substring(7).trim();

            // Token geçerli mi kontrolü
            if (jwtService.isTokenValid(token)) {
                String email = jwtService.extractSubject(token);

                // Kullanıcıyı context'e ekle
                var authentication = new UsernamePasswordAuthenticationToken(
                        email,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_USER")) // Burayı ilerde DB'den çekeceğiz
                );

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            // HATA OLUŞSA BİLE (Token süresi dolmuş, bozuk vs.)
            // Log bas ama hatayı yut. Zincir devam etsin ki Public sayfalar açılabilsin.
            System.out.println("JWT Filter Hatası (Önemli değil): " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}