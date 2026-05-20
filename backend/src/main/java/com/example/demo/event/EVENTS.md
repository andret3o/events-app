
## Endpoints Summary

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/events` | Create a new event | Yes |
| `GET` | `/api/events/{id}` | Retrieve event by ID | No |
| `GET` | `/api/events` | Get paged list of all events | No |
| `GET` | `/api/events/all` | Get all events (unpaged) | No |
| `GET` | `/api/events/category/{category}` | Get paged events by category | No |
| `GET` | `/api/events/owner/{ownerId}` | Get paged events by owner | No |
| `GET` | `/api/events/upcoming` | Get upcoming events | No |
| `PUT` | `/api/events/{id}` | Update an existing event | Yes |
| `DELETE` | `/api/events/{id}` | Delete an event | Yes |