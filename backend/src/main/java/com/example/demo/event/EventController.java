package com.example.demo.event;

import com.example.demo.event.dto.EventRequestDTO;
import com.example.demo.event.dto.EventResponseDTO;
import com.example.demo.event.enums.EventCategory;
import com.example.demo.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @PostMapping
    public ResponseEntity<EventResponseDTO> createEvent(
            @Valid @ModelAttribute EventRequestDTO requestDTO,
            @AuthenticationPrincipal User currentUser) {

        EventResponseDTO createdEvent = eventService.createEvent(requestDTO, currentUser);
        return new ResponseEntity<>(createdEvent, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventResponseDTO> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    @GetMapping
    public ResponseEntity<Page<EventResponseDTO>> getPagedEvents(
            @PageableDefault(size = 20, sort = "startTime", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(eventService.getEvents(pageable));
    }

    @GetMapping("/all")
    public ResponseEntity<List<EventResponseDTO>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<Page<EventResponseDTO>> getEventsByCategory(
            @PathVariable EventCategory category,
            Pageable pageable) {
        return ResponseEntity.ok(eventService.getEventsByCategory(category, pageable));
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<Page<EventResponseDTO>> getEventsByOwner(
            @PathVariable Long ownerId,
            Pageable pageable) {
        return ResponseEntity.ok(eventService.getEventsByOwner(ownerId, pageable));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<Page<EventResponseDTO>> getUpcomingEvents(Pageable pageable) {
        return ResponseEntity.ok(eventService.getUpcomingEvents(pageable));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventResponseDTO> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody EventRequestDTO requestDTO,
            @AuthenticationPrincipal User currentUser) {

        return ResponseEntity.ok(eventService.updateEvent(id, requestDTO, currentUser));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        eventService.deleteEvent(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}