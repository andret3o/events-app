package com.example.demo.event.dto;

import com.example.demo.event.enums.EventCategory;
import com.example.demo.event.enums.EventType;

import java.time.Instant;

public record EventResponseDTO(
        Long id,

        String title,

        String description,

        EventCategory category,

        EventType eventType,

        String locationString,

        double latitude,

        double longitude,

        Instant startTime,

        Instant endTime,

        Instant createdAt
) {}
