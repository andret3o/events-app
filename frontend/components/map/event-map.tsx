"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  MapPin,
  Clock,
  Music,
  Trophy,
  Utensils,
  Theater,
  Compass,
} from "lucide-react";
import { getAllEvents } from "@/lib/api/events";
import { EventResponse } from "@/types/types";
import { toast } from "sonner";

const MapContainer = dynamic(() => import("./map-container"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted">
      Loading..
    </div>
  ),
});

export default function EventMap() {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(
    null,
  );

  useEffect(() => {
    async function fetch() {
      const res = await getAllEvents();

      if (!res.success) {
        toast.error("Error fetching events", {
          position: "top-center",
        });
      }

      if (res.success && res.data) {
        setEvents(res.data);
      }
    }
    fetch();
  }, []);

  return (
    <div className=" w-full h-full rounded-2xl overflow-hidden border border-border shadow-md bg-card">
      {/* Dynamic Map Component */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          events={events}
          selectedEvent={selectedEvent}
          onSelectEvent={setSelectedEvent}
        />
      </div>
    </div>
  );
}
