# Events API Documentation

This module handles event creation, discovery, modification, and deletion. It features complete pagination support, validation constraints, and strict ownership checks to ensure users can only modify their own events.

## Base URL
All URIs are relative to: `http://localhost:8080/api/events`

---

## Data Transfer Objects (DTOs)

### EventRequestDTO
Used for creating and updating events.
```json
{
  "title": "Spring Boot Developer Meetup",
  "description": "A networking and technical talk event for Java and Spring Boot developers.",
  "category": "CONFERENCE",
  "locationString": "Innovation Hub, Room 302",
  "latitude": 59.437,
  "longitude": 24.7536,
  "startTime": "2026-06-15T18:00:00Z",
  "endTime": "2026-06-15T21:00:00Z"
}
```

### EventResponseDTO
Returned by the API upon successful retrieval or modification.
```json
{
  "id": 1,
  "title": "Spring Boot Developer Meetup",
  "description": "A networking and technical talk event for Java and Spring Boot developers.",
  "category": "CONFERENCE",
  "type": "STANDARD",
  "locationString": "Innovation Hub, Room 302",
  "latitude": 59.437,
  "longitude": 24.7536,
  "startTime": "2026-06-15T18:00:00Z",
  "endTime": "2026-06-15T21:00:00Z",
  "createdAt": "2026-05-18T15:30:00Z"
}
```

---

## Pagination Parameters

All `GET` endpoints that return list data support Spring Data Pagination using query parameters:
* `page` (integer, default: 0): The page index to retrieve.
* `size` (integer, default: 20): The number of records per page.
* `sort` (string): Sorting criteria in the format `property,asc` or `property,desc`. (e.g., `sort=startTime,desc`).

---

## Endpoints Summary

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/` | Create a new event | Yes |
| **GET** | `/{id}` | Get event by ID | No |
| **GET** | `/` | Get all events (Paginated) | No |
| **GET** | `/category/{category}` | Get events by category (Paginated) | No |
| **GET** | `/owner/{ownerId}` | Get events by owner ID (Paginated) | No |
| **GET** | `/upcoming` | Get upcoming events (Paginated) | No |
| **PUT** | `/{id}` | Update an existing event | Yes (Owner only) |
| **DELETE** | `/{id}` | Delete an event | Yes (Owner only) |

---

## Endpoint Details & Examples

### 1. Create a New Event
* **Endpoint:** `POST /api/events`
* **Headers:** `Authorization: Bearer <token>`
* **Request Body:** `EventRequestDTO`

#### Example Curl:
```bash
curl -X POST http://localhost:8080/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token_here" \
  -d '{
    "title": "Tech Conference 2026",
    "description": "Annual gathering of tech innovators.",
    "category": "CONFERENCE",
    "locationString": "Tallinn Creative Hub",
    "latitude": 59.4442,
    "longitude": 24.7505,
    "startTime": "2026-09-10T09:00:00Z",
    "endTime": "2026-09-12T17:00:00Z"
  }'
```

#### Response (`211 Created`):
```json
{
  "id": 12,
  "title": "Tech Conference 2026",
  "description": "Annual gathering of tech innovators.",
  "category": "CONFERENCE",
  "type": "STANDARD",
  "locationString": "Tallinn Creative Hub",
  "latitude": 59.4442,
  "longitude": 24.7505,
  "startTime": "2026-09-10T09:00:00Z",
  "endTime": "2026-09-12T17:00:00Z",
  "createdAt": "2026-05-18T18:15:00Z"
}
```

---

### 2. Get Event By ID
* **Endpoint:** `GET /api/events/{id}`
* **Auth Required:** No

#### Example Curl:
```bash
curl -X GET http://localhost:8080/api/events/12
```

#### Response (`200 OK`):
```json
{
  "id": 12,
  "title": "Tech Conference 2026",
  "description": "Annual gathering of tech innovators.",
  "category": "CONFERENCE",
  "type": "STANDARD",
  "locationString": "Tallinn Creative Hub",
  "latitude": 59.4442,
  "longitude": 24.7505,
  "startTime": "2026-09-10T09:00:00Z",
  "endTime": "2026-09-12T17:00:00Z",
  "createdAt": "2026-05-18T18:15:00Z"
}
```

---

### 3. Get All Events (With Pagination)
* **Endpoint:** `GET /api/events?page=0&size=2&sort=createdAt,desc`
* **Auth Required:** No

#### Example Curl:
```bash
curl -X GET "http://localhost:8080/api/events?page=0&size=2&sort=createdAt,desc"
```

#### Response (`200 OK`):
```json
{
  "content": [
    {
      "id": 12,
      "title": "Tech Conference 2026",
      "description": "Annual gathering of tech innovators.",
      "category": "CONFERENCE",
      "type": "STANDARD",
      "locationString": "Tallinn Creative Hub",
      "latitude": 59.4442,
      "longitude": 24.7505,
      "startTime": "2026-09-10T09:00:00Z",
      "endTime": "2026-09-12T17:00:00Z",
      "createdAt": "2026-05-18T18:15:00Z"
    },
    {
      "id": 11,
      "title": "Local Concert",
      "description": "Live music in the park.",
      "category": "CONCERT",
      "type": "STANDARD",
      "locationString": "Kadriorg Park",
      "latitude": 59.4382,
      "longitude": 24.7912,
      "startTime": "2026-05-20T19:00:00Z",
      "endTime": "2026-05-20T22:00:00Z",
      "createdAt": "2026-05-17T12:00:00Z"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 2,
    "sort": {
      "empty": false,
      "sorted": true,
      "unsorted": false
    },
    "offset": 0,
    "paged": true,
    "unpaged": false
  },
  "totalPages": 5,
  "totalElements": 10,
  "last": false,
  "size": 2,
  "number": 0,
  "sort": {
    "empty": false,
    "sorted": true,
    "unsorted": false
  },
  "numberOfElements": 2,
  "first": true,
  "empty": false
}
```

---

### 4. Get Events By Category
* **Endpoint:** `GET /api/events/category/{category}`
* **Auth Required:** No

#### Example Curl:
```bash
curl -X GET "http://localhost:8080/api/events/category/CONFERENCE?page=0&size=10"
```

---

### 5. Get Events By Owner
* **Endpoint:** `GET /api/events/owner/{ownerId}`
* **Auth Required:** No

#### Example Curl:
```bash
curl -X GET "http://localhost:8080/api/events/owner/5?page=0&size=10"
```

---

### 6. Get Upcoming Events
Filters events dynamically where `startTime` is later than the current timestamp.
* **Endpoint:** `GET /api/events/upcoming`
* **Auth Required:** No

#### Example Curl:
```bash
curl -X GET "http://localhost:8080/api/events/upcoming?page=0&size=5&sort=startTime,asc"
```

---

### 7. Update an Event
Updates an event's details. Enforces ownership verification behind the scenes.
* **Endpoint:** `PUT /api/events/{id}`
* **Headers:** `Authorization: Bearer <token>`
* **Request Body:** `EventRequestDTO`

#### Example Curl:
```bash
curl -X PUT http://localhost:8080/api/events/12 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token_here" \
  -d '{
    "title": "Tech Conference 2026 (Updated)",
    "description": "Updated description for the annual tech summit.",
    "category": "CONFERENCE",
    "locationString": "Tallinn Creative Hub, Main Hall",
    "latitude": 59.4442,
    "longitude": 24.7505,
    "startTime": "2026-09-10T08:30:00Z",
    "endTime": "2026-09-12T18:00:00Z"
  }'
```

#### Response (`200 OK`):
Returns the updated `EventResponseDTO`.

---

### 8. Delete an Event
Removes an event. Enforces ownership verification behind the scenes.
* **Endpoint:** `DELETE /api/events/{id}`
* **Headers:** `Authorization: Bearer <token>`

#### Example Curl:
```bash
curl -X DELETE http://localhost:8080/api/events/12 \
  -H "Authorization: Bearer your_jwt_token_here"
```

#### Response (`204 No Content`):
Status code `204` with an empty response body indicates successful deletion.

---

## Error Handling Scenarios

| Status Code | Scenario | JSON Payload Example |
| :--- | :--- | :--- |
| **400 Bad Request** | Request validation fails (e.g., missing title, invalid latitude) | `{"title": "Title is required"}` |
| **401 Unauthorized** | Missing or invalid Bearer JWT token | Standard Spring Security 401 payload |
| **403 Forbidden** | Attempted to update/delete an event owned by another user | `{"message": "You do not have permission to update this event."}` |
| **404 Not Found** | Event ID does not exist | `{"message": "Event not found with id: 12"}` |