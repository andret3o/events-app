"use client";

import { useEffect, useRef, useState } from "react";
import Map, { Marker, Popup, MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { EventResponse } from "@/types/event";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Filter, Navigation } from "lucide-react";
import { useTheme } from "next-themes";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MapContainerProps {
  events: EventResponse[];
  selectedEvent: EventResponse | null;
  onSelectEvent: (event: EventResponse | null) => void;
}

type ThemeOption = "dark" | "light";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  NIGHTLIFE: "#8b5cf6",
  MUSIC: "#ef4444",
  TECH: "#3b82f6",
  SPORT: "#10b981",
  SOCIAL: "#f59e0b",
  EDUCATIONAL: "#6366f1",
  ART: "#ec4899",
  OTHER: "#6b7280",
};

const TALLINN_BOUNDS: [number, number, number, number] = [
  24.3, 59.3, 25.1, 59.6,
];

const MAP_STYLES: Record<ThemeOption, string> = {
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(isoString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(isoString));
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MapContainer({
  events,
  selectedEvent,
  onSelectEvent,
}: MapContainerProps) {
  const mapRef = useRef<MapRef>(null);
  const { resolvedTheme } = useTheme();

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Filter state
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState(
    new Date().toLocaleDateString("en-CA"),
  );

  const mapStyle = MAP_STYLES[(resolvedTheme as ThemeOption) ?? "light"];

  // Fly to selected event
  useEffect(() => {
    if (!selectedEvent || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [selectedEvent.longitude, selectedEvent.latitude],
      zoom: 15,
      pitch: 45,
      duration: 1800,
    });
  }, [selectedEvent]);

  // Geolocation
  function handleLocateUser() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setIsLocating(false);
        mapRef.current?.flyTo({
          center: [longitude, latitude],
          zoom: 14,
          pitch: 0,
          duration: 1500,
        });
      },
      (err) => {
        console.error("Geolocation error", err);
        alert(
          "Unable to retrieve your location. Please check your permissions.",
        );
        setIsLocating(false);
      },
    );
  }

  // Filtered events
  const filteredEvents = events.filter((event) => {
    if (categoryFilter !== "ALL" && event.category !== categoryFilter)
      return false;
    if (typeFilter !== "ALL" && event.eventType !== typeFilter) return false;
    if (dateFilter && event.startTime.split("T")[0] !== dateFilter)
      return false;
    return true;
  });

  return (
    // fill the relative parent provided by EventMap
    <div className="absolute inset-0">
      {/* ── Map ── */}
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: 24.7536,
          latitude: 59.437,
          zoom: 13,
          pitch: 35,
        }}
        maxBounds={TALLINN_BOUNDS}
        style={{ width: "100%", height: "100%" }}
        mapStyle={mapStyle}
        attributionControl={false}
        onClick={() => onSelectEvent(null)}
      >
        {/* User location dot */}
        {userLocation && (
          <Marker longitude={userLocation.lng} latitude={userLocation.lat}>
            <div className="relative flex h-6 w-6 items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-40 animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-600 border-2 border-white shadow-md" />
            </div>
          </Marker>
        )}

        {/* Event markers */}
        {filteredEvents.map((event) => {
          const color =
            CATEGORY_COLORS[event.category] ?? CATEGORY_COLORS.OTHER;
          const isSelected = selectedEvent?.id === event.id;

          return (
            <div key={event.id}>
              <Marker
                longitude={event.longitude}
                latitude={event.latitude}
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  onSelectEvent(event);
                }}
              >
                <div className="relative flex h-10 w-10 cursor-pointer items-center justify-center group">
                  <span
                    className="absolute inline-flex h-full w-full rounded-full opacity-20 animate-ping"
                    style={{ backgroundColor: color }}
                  />
                  <span
                    className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white/80 shadow-sm transition-transform duration-300 group-hover:scale-125"
                    style={{
                      backgroundColor: color,
                      transform: isSelected ? "scale(1.35)" : undefined,
                    }}
                  />
                </div>
              </Marker>

              {/* Popup */}
              {isSelected && (
                <Popup
                  longitude={event.longitude}
                  latitude={event.latitude}
                  offset={12}
                  closeButton={false}
                  closeOnClick={false}
                  anchor="bottom"
                  // Remove maplibre's default white wrapper so our glass div shows
                  className="[&_.maplibregl-popup-content]:!p-0 [&_.maplibregl-popup-content]:!bg-transparent [&_.maplibregl-popup-content]:!shadow-none [&_.maplibregl-popup-tip]:!border-t-transparent"
                >
                  {/* Glass popup card */}
                  <div className="glass-heavy rounded-xl p-4 min-w-[220px] max-w-[280px]">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span
                        className="h-1.5 w-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {event.category}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm leading-snug text-foreground">
                      {event.title}
                    </h4>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                      {event.locationString}
                    </p>
                    <div className="mt-2.5 border-t border-border pt-2 text-[11px] font-medium text-foreground">
                      {formatDate(event.startTime)}
                    </div>
                  </div>
                </Popup>
              )}
            </div>
          );
        })}
      </Map>

      {/* ── Floating controls (above the map) ── */}
      <div
        className="absolute left-4 top-4 z-10 flex flex-col gap-2"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingLeft: "env(safe-area-inset-left)",
        }}
      >
        {/* Filter dialog trigger */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              size="icon"
              variant="secondary"
              className="glass h-11 w-11 rounded-full border-0"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </DialogTrigger>

          <DialogContent className="glass-heavy w-[95vw] max-w-md rounded-2xl border-0 p-5 max-h-[90dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Filter Events</DialogTitle>
              <DialogDescription>
                Narrow down the map to find exactly what you're looking for.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-5 pt-2">
              {/* Category */}
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover/95 backdrop-blur-xl border-border">
                    <SelectGroup>
                      <SelectItem value="ALL">All Categories</SelectItem>
                      <SelectItem value="NIGHTLIFE">Nightlife</SelectItem>
                      <SelectItem value="MUSIC">Music</SelectItem>
                      <SelectItem value="TECH">Tech</SelectItem>
                      <SelectItem value="SPORT">Sport</SelectItem>
                      <SelectItem value="SOCIAL">Social</SelectItem>
                      <SelectItem value="EDUCATIONAL">Educational</SelectItem>
                      <SelectItem value="ART">Art</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Event type */}
              <div className="grid gap-2">
                <Label htmlFor="type">Event Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover/95 backdrop-blur-xl border-border">
                    <SelectGroup>
                      <SelectItem value="ALL">All Types</SelectItem>
                      <SelectItem value="COMMUNITY">Community</SelectItem>
                      <SelectItem value="VENUE">Venue</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="text-base sm:text-sm" // prevents iOS auto-zoom
                />
              </div>

              {/* Clear */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setCategoryFilter("ALL");
                  setTypeFilter("ALL");
                  setDateFilter("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Locate me */}
        <Button
          size="icon"
          variant="secondary"
          onClick={handleLocateUser}
          disabled={isLocating}
          className="glass h-11 w-11 rounded-full border-0"
        >
          <Navigation
            className={`h-4 w-4 transition-colors ${isLocating ? "animate-pulse text-blue-500" : ""}`}
          />
        </Button>
      </div>
    </div>
  );
}
