package com.example.stock_management.api;

import java.time.Instant;
import java.util.List;

public record ApiErrorResponse(
    Instant timestamp,
    int status,
    String code,
    String message,
    String path,
    List<FieldValidationError> errors
) {
    public static ApiErrorResponse validation(String message, String path, List<FieldValidationError> errors) {
        return new ApiErrorResponse(Instant.now(), 400, "VALIDATION_ERROR", message, path, errors);
    }

    public static ApiErrorResponse badRequest(String message, String path) {
        return new ApiErrorResponse(Instant.now(), 400, "BAD_REQUEST", message, path, List.of());
    }

    public static ApiErrorResponse notFound(String message, String path) {
        return new ApiErrorResponse(Instant.now(), 404, "NOT_FOUND", message, path, List.of());
    }

    public record FieldValidationError(String field, String message) {
    }
}


