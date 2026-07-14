package com.meetingflow.service;

import com.meetingflow.config.JwtTokenProvider;
import com.meetingflow.dto.AuthResponse;
import com.meetingflow.dto.LoginRequest;
import com.meetingflow.dto.RegisterRequest;
import com.meetingflow.entity.Role;
import com.meetingflow.entity.RoleName;
import com.meetingflow.entity.User;
import com.meetingflow.repository.RoleRepository;
import com.meetingflow.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository,
                       RoleRepository roleRepository, PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found: " + loginRequest.getUsername()));

        Set<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        return new AuthResponse(jwt, user.getId(), user.getUsername(), user.getFullName(), user.getEmail(), roles);
    }

    @Transactional
    public User registerUser(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email Address already in use!");
        }

        // Creating user's account
        User user = new User(
                registerRequest.getUsername(),
                registerRequest.getEmail(),
                passwordEncoder.encode(registerRequest.getPassword()),
                registerRequest.getFullName()
        );

        Set<Role> roles = new HashSet<>();
        String requestedRole = registerRequest.getRole();
        if (requestedRole == null) {
            Role userRole = roleRepository.findByName(RoleName.ROLE_MEMBER)
                    .orElseThrow(() -> new RuntimeException("Error: Role was not found."));
            roles.add(userRole);
        } else {
            switch (requestedRole.toUpperCase()) {
                case "ADMIN":
                    Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                            .orElseThrow(() -> new RuntimeException("Error: Role was not found."));
                    roles.add(adminRole);
                    break;
                case "MANAGER":
                    Role managerRole = roleRepository.findByName(RoleName.ROLE_MANAGER)
                            .orElseThrow(() -> new RuntimeException("Error: Role was not found."));
                    roles.add(managerRole);
                    break;
                default:
                    Role userRole = roleRepository.findByName(RoleName.ROLE_MEMBER)
                            .orElseThrow(() -> new RuntimeException("Error: Role was not found."));
                    roles.add(userRole);
            }
        }

        user.setRoles(roles);
        return userRepository.save(user);
    }
}
