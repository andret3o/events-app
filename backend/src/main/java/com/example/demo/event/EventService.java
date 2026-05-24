package com.example.demo.event;

import com.example.demo.event.dto.EventRequestDTO;
import com.example.demo.event.dto.EventResponseDTO;
import com.example.demo.event.enums.EventCategory;
import com.example.demo.event.enums.EventType;
import com.example.demo.user.User;
import com.example.demo.user.enums.Role;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;

    // Standard SRID 4326 is typically used for GPS coordinates (WGS84)
    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

    @Transactional
    public EventResponseDTO createEvent(EventRequestDTO requestDTO, User owner) {
        EventType type = owner.getRole() == Role.VENUE ? EventType.VENUE : EventType.COMMUNITY;

        Event event = Event.builder()
                .title(requestDTO.title())
                .description(requestDTO.description())
                .category(requestDTO.category())
                .type(type)
                .locationString(requestDTO.locationString())
                .coordinates(createPoint(requestDTO.latitude(), requestDTO.longitude()))
                .startTime(requestDTO.startTime())
                .endTime(requestDTO.endTime())
                .owner(owner)
                .build();

        Event savedEvent = eventRepository.save(event);
        return mapToResponseDTO(savedEvent);
    }

    @Transactional(readOnly = true)
    public EventResponseDTO getEventById(Long id) {
        Event event = getEventEntityById(id);
        return mapToResponseDTO(event);
    }

    @Transactional(readOnly = true)
    public Page<EventResponseDTO> getEvents(Pageable pageable) {
        return eventRepository.findAll(pageable).map(this::mapToResponseDTO);
    }

    @Transactional(readOnly = true)
    public List<EventResponseDTO> getAllEvents() {
        return eventRepository.findAll().stream().map(this::mapToResponseDTO).toList();
    }

    @Transactional(readOnly = true)
    public Page<EventResponseDTO> getEventsByCategory(EventCategory category, Pageable pageable) {
        return eventRepository.findByCategory(category, pageable).map(this::mapToResponseDTO);
    }

    @Transactional(readOnly = true)
    public Page<EventResponseDTO> getEventsByOwner(Long ownerId, Pageable pageable) {
        return eventRepository.findByOwnerId(ownerId, pageable).map(this::mapToResponseDTO);
    }

    @Transactional(readOnly = true)
    public Page<EventResponseDTO> getUpcomingEvents(Pageable pageable) {
        return eventRepository.findByStartTimeAfter(Instant.now(), pageable).map(this::mapToResponseDTO);
    }

    @Transactional
    public EventResponseDTO updateEvent(Long id, EventRequestDTO requestDTO, User currentUser) {
        Event existingEvent = getEventEntityById(id);

        // Authorization check: Only the owner can update the event
        if (!existingEvent.getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You do not have permission to update this event.");
        }

        existingEvent.setTitle(requestDTO.title());
        existingEvent.setDescription(requestDTO.description());
        existingEvent.setCategory(requestDTO.category());
        existingEvent.setLocationString(requestDTO.locationString());
        existingEvent.setCoordinates(createPoint(requestDTO.latitude(), requestDTO.longitude()));
        existingEvent.setStartTime(requestDTO.startTime());
        existingEvent.setEndTime(requestDTO.endTime());

        Event updatedEvent = eventRepository.save(existingEvent);
        return mapToResponseDTO(updatedEvent);
    }

    @Transactional
    public void deleteEvent(Long id, User currentUser) {
        Event existingEvent = getEventEntityById(id);

        // Authorization check: Only the owner can delete the event
        if (!existingEvent.getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You do not have permission to delete this event.");
        }

        eventRepository.delete(existingEvent);
    }

    // --- Helper Methods ---

    private Event getEventEntityById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + id));
    }

    private Point createPoint(double latitude, double longitude) {
        // JTS Coordinate takes (x, y) which translates to (longitude, latitude)
        return geometryFactory.createPoint(new Coordinate(longitude, latitude));
    }

    private EventResponseDTO mapToResponseDTO(Event event) {
        return new EventResponseDTO(
                event.getId(),
                event.getOwner().getId(),
                event.getOwner().getName(),
                event.getOwner().getUsername(),
                event.getTitle(),
                event.getDescription(),
                event.getCategory(),
                event.getType(),
                event.getLocationString(),
                event.getCoordinates().getY(), // Latitude is Y
                event.getCoordinates().getX(), // Longitude is X
                event.getStartTime(),
                event.getEndTime(),
                event.getCreatedAt()
        );
    }
}