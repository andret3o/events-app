export type EventCategory =
  | "NIGHTLIFE"
  | "MUSIC"
  | "TECH"
  | "SPORT"
  | "SOCIAL"
  | "EDUCATIONAL"
  | "ART"
  | "OTHER";

export type EventType = "COMMUNITY" | "VENUE";

export interface EventResponse {
  id: number;
  title: string;
  description: string;
  category: EventCategory;
  eventType: EventType;
  locationString: string;
  latitude: number;
  longitude: number;
  startTime: string;
  endTime: string;
  createdAt: string;
}

export interface EventRequest {
  title: string;
  description: string;
  category: EventCategory;
  locationString: string;
  latitude: number;
  longitude: number;
  startTime: string; // ISO Instant string
  endTime: string; // ISO Instant string
}
