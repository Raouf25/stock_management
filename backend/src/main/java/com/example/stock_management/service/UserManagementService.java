package com.example.stock_management.service;

import com.example.stock_management.api.ResourceNotFoundException;
import com.example.stock_management.dto.UserCreateDTO;
import com.example.stock_management.dto.UserSummaryDTO;
import com.example.stock_management.dto.UserUpdateDTO;
import com.example.stock_management.model.User;
import com.example.stock_management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserManagementService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public Page<UserSummaryDTO> getUsers(int page, int size, String search) {
        final PageRequest pageable = PageRequest.of(page, size);
        return userRepository.searchUsers(search, pageable).map(this::toDTO);
    }

    public UserSummaryDTO getUser(Long id) {
        return toDTO(findOrThrow(id));
    }

    @Transactional
    public UserSummaryDTO createUser(UserCreateDTO dto) {
        if (userRepository.existsByEmail(dto.email())) {
            throw new IllegalArgumentException("Un compte avec cet email existe déjà : " + dto.email());
        }

        final User user = User.builder()
                .email(dto.email())
                .name(dto.fullName())
                .password(passwordEncoder.encode(dto.password()))
                .role(dto.role())
                .enabled(true)
                .build();

        final User saved = userRepository.save(user);
        log.info("Utilisateur créé par un admin : {}", saved.getEmail());
        return toDTO(saved);
    }

    @Transactional
    public UserSummaryDTO updateUser(Long id, UserUpdateDTO dto) {
        final User user = findOrThrow(id);

        if (userRepository.existsByEmailAndIdNot(dto.email(), id)) {
            throw new IllegalArgumentException("Cet email est déjà utilisé par un autre compte.");
        }

        user.setEmail(dto.email());
        user.setName(dto.fullName());
        user.setRole(dto.role());

        final User saved = userRepository.save(user);
        log.info("Utilisateur {} mis à jour par un admin", saved.getEmail());
        return toDTO(saved);
    }

    @Transactional
    public UserSummaryDTO toggleStatus(Long id) {
        final User user = findOrThrow(id);
        user.setEnabled(!user.isEnabled());
        final User saved = userRepository.save(user);
        log.info("Statut de l'utilisateur {} basculé vers : {}", saved.getEmail(), saved.isEnabled());
        return toDTO(saved);
    }

    @Transactional
    public void resetPassword(Long id, String newPassword) {
        if (newPassword == null || newPassword.length() < 6) {
            throw new IllegalArgumentException("Le mot de passe doit contenir au moins 6 caractères.");
        }
        final User user = findOrThrow(id);
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("Mot de passe réinitialisé par admin pour : {}", user.getEmail());
    }

    @Transactional
    public void deleteUser(Long id) {
        final User user = findOrThrow(id);
        userRepository.delete(user);
        log.info("Utilisateur {} supprimé par un admin", user.getEmail());
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private User findOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable avec l'ID : " + id));
    }

    private UserSummaryDTO toDTO(User user) {
        return new UserSummaryDTO(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole(),
                user.isEnabled(),
                user.getCreatedAt(),
                user.getLastLogin()
        );
    }
}
