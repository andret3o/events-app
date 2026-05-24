"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { getAllEvents } from "@/lib/api/event";
import { EventResponse } from "@/types/event";
import { toast } from "sonner";

const MapContainer = dynamic(() => import("./map-container"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-sm">
      Loading map…
    </div>
  ),
});

export default function EventMap() {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(
    null,
  );

  useEffect(() => {
    async function fetchEvents() {
      const res = await getAllEvents();
      if (!res.success) {
        toast.error("Error fetching events", { position: "top-center" });
        return;
      }
      if (res.data) setEvents(res.data);
    }
    fetchEvents();
  }, []);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-border shadow-md">
      <MapContainer
        events={events}
        selectedEvent={selectedEvent}
        onSelectEvent={setSelectedEvent}
      />
    </div>
  );
}
