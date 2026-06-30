package com.example.stock_management.api;

import java.time.LocalDateTime;

/**
 * Thrown when a user account is temporarily locked after too many failed login attempts.
 */
public class AccountLockedException extends RuntimeException {

    private final LocalDateTime lockedUntil;
    private final long minutesRemaining;

    public AccountLockedException(LocalDateTime lockedUntil, long minutesRemaining) {
        super("Account is locked until " + lockedUntil);
        this.lockedUntil = lockedUntil;
        this.minutesRemaining = minutesRemaining;
    }

    public LocalDateTime getLockedUntil() {
        return lockedUntil;
    }

    public long getMinutesRemaining() {
        return minutesRemaining;
    }
}
