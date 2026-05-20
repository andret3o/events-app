package com.example.demo.event;

import com.example.demo.event.enums.EventCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    // Find events by their category with pagination
    Page<Event> findByCategory(EventCategory category, Pageable pageable);

    // Find events belonging to a specific user with pagination
    Page<Event> findByOwnerId(Long ownerId, Pageable pageable);

    // Find upcoming events (useful for feeds/dashboards)
    Page<Event> findByStartTimeAfter(Instant time, Pageable pageable);
}
