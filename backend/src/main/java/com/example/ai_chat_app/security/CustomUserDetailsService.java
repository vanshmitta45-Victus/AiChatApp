package com.example.ai_chat_app.security;

import com.example.ai_chat_app.model.User;
import com.example.ai_chat_app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        User user = userRepository.findByUsernameOrEmailIgnoreCase(identifier.trim())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with identifier: " + identifier));

        if ("SUSPENDED".equalsIgnoreCase(user.getStatus())) {
            throw new LockedException("User account is suspended");
        }
        if ("DEACTIVATED".equalsIgnoreCase(user.getStatus())) {
            throw new DisabledException("User account is deactivated");
        }

        return new CustomUserDetails(user);
    }

    public static class CustomUserDetails implements UserDetails {

        private final User user;
        private final List<GrantedAuthority> authorities;

        public CustomUserDetails(User user) {
            this.user = user;
            this.authorities = new ArrayList<>();

            String rawRole = user.getRole();
            if (rawRole != null) {
                String clean = rawRole.trim().toUpperCase();
                if (clean.startsWith("ROLE_")) {
                    clean = clean.substring(5);
                }
                authorities.add(new SimpleGrantedAuthority("ROLE_" + clean));
                authorities.add(new SimpleGrantedAuthority(clean));
            } else {
                authorities.add(new SimpleGrantedAuthority("ROLE_STAFF"));
                authorities.add(new SimpleGrantedAuthority("STAFF"));
            }
        }

        public User getUser() {
            return user;
        }

        public Long getId() {
            return user.getId();
        }

        @Override
        public Collection<? extends GrantedAuthority> getAuthorities() {
            return authorities;
        }

        @Override
        public String getPassword() {
            return user.getPassword();
        }

        @Override
        public String getUsername() {
            return user.getUsername() != null ? user.getUsername() : user.getEmail();
        }

        @Override
        public boolean isAccountNonExpired() {
            return true;
        }

        @Override
        public boolean isAccountNonLocked() {
            return !"SUSPENDED".equalsIgnoreCase(user.getStatus());
        }

        @Override
        public boolean isCredentialsNonExpired() {
            return true;
        }

        @Override
        public boolean isEnabled() {
            return !"DEACTIVATED".equalsIgnoreCase(user.getStatus());
        }
    }
}
