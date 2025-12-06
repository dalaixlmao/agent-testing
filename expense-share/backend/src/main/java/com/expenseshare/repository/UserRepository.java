package com.expenseshare.repository;

import com.expenseshare.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for User entity.
 * Provides database operations for user management.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find user by email address.
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if user exists by email.
     */
    Boolean existsByEmail(String email);

    /**
     * Find user by provider and provider ID (for OAuth2).
     */
    Optional<User> findByProviderAndProviderId(User.AuthProvider provider, String providerId);
}
