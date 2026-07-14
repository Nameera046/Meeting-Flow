package com.meetingflow.service;

import com.meetingflow.dto.UserDto;
import com.meetingflow.entity.Role;
import com.meetingflow.entity.RoleName;
import com.meetingflow.entity.User;
import com.meetingflow.repository.RoleRepository;
import com.meetingflow.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public UserService(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Transactional(readOnly = true)
    public User getCurrentUserEntity() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Current user not found."));
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser() {
        User user = getCurrentUserEntity();
        return new UserDto(user.getId(), user.getUsername(), user.getFullName(), user.getEmail());
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> new UserDto(user.getId(), user.getUsername(), user.getFullName(), user.getEmail()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Initialize Roles if they do not exist
        for (RoleName roleName : RoleName.values()) {
            if (roleRepository.findByName(roleName).isEmpty()) {
                roleRepository.save(new Role(roleName));
            }
        }
    }
}
