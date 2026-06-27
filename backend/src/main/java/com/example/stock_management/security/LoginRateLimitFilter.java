package com.example.stock_management.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Limits brute-force attempts on auth endpoints to MAX_REQUESTS per WINDOW_MS per IP.
 * Uses a sliding-window counter stored in memory — no external dependency required.
 * Inactive IP entries are evicted every 5 minutes to prevent unbounded map growth.
 */
@Slf4j
@Component
public class LoginRateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_REQUESTS = 10;
    private static final long WINDOW_MS   = 60_000L; // 1 minute

    private static final Set<String> PROTECTED_PATHS = Set.of(
            "/api/auth/login",
            "/api/auth/forgot-password"
    );

    // IP → timestamps of recent requests within the current window
    private final ConcurrentHashMap<String, Deque<Long>> requestLog = new ConcurrentHashMap<>();

    /** Remove IPs whose last request is older than the sliding window. */
    @Scheduled(fixedDelay = 5 * 60 * 1000)
    void evictStaleEntries() {
        long cutoff = System.currentTimeMillis() - WINDOW_MS;
        int before = requestLog.size();
        requestLog.entrySet().removeIf(entry -> {
            synchronized (entry.getValue()) {
                return entry.getValue().isEmpty() || entry.getValue().peekLast() < cutoff;
            }
        });
        int removed = before - requestLog.size();
        if (removed > 0) {
            log.debug("Rate limiter: evicted {} stale IP entries", removed);
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !PROTECTED_PATHS.contains(request.getRequestURI());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String ip = resolveClientIp(request);
        long now = System.currentTimeMillis();

        Deque<Long> timestamps = requestLog.computeIfAbsent(ip, k -> new ArrayDeque<>());

        synchronized (timestamps) {
            // Evict timestamps outside the sliding window
            while (!timestamps.isEmpty() && now - timestamps.peekFirst() > WINDOW_MS) {
                timestamps.pollFirst();
            }

            if (timestamps.size() >= MAX_REQUESTS) {
                log.warn("Rate limit exceeded for IP {} on {}", ip, request.getRequestURI());
                writeTooManyRequests(response);
                return;
            }

            timestamps.addLast(now);
        }

        chain.doFilter(request, response);
    }

    private static String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private static void writeTooManyRequests(HttpServletResponse response) throws IOException {
        response.setStatus(429);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("""
                {"status":429,"error":"Too Many Requests",\
                "message":"Trop de tentatives. Réessayez dans 1 minute."}""");
    }
}
