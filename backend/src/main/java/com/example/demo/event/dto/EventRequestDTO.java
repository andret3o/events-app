package com.example.demo.event.dto;

import com.example.demo.event.enums.EventCategory;
import com.example.demo.event.enums.EventType;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record EventRequestDTO(
        @NotNull(message = "Title is required")
        String title,

        String description,

        @NotNull(message = "Category is required")
        EventCategory category,

        @NotNull
        String locationString,

        @NotNull
        @DecimalMin("-90.0")
        @DecimalMax("90.0")
        double latitude,

        @NotNull
        @DecimalMin("-180.0")
        @DecimalMax("180.0")
        double longitude,

        @NotNull(message = "Start time is required")
        Instant startTime,

        @NotNull(message = "End time is required")
        Instant endTime
) {
}
