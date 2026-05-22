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

interface MapContainerProps {
  events: EventResponse[];
  selectedEvent: EventResponse | null;
  onSelectEvent: (event: EventResponse | null) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  NIGHTLIFE: "#8b5cf6", // Purple
  MUSIC: "#ef4444", // Red
  TECH: "#3b82f6", // Blue
  SPORT: "#10b981", // Green
  SOCIAL: "#f59e0b", // Amber
  EDUCATIONAL: "#6366f1", // Indigo
  ART: "#ec4899", // Pink
  OTHER: "#6b7280", // Gray
};

const TALLINN_BOUNDS: [number, number, number, number] = [
  24.3, 59.3, 25.1, 59.6,
];

type ThemeOption = "dark" | "light";

const MAP_STYLES: Record<ThemeOption, string> = {
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
};
export default function MapContainer({
  events,
  selectedEvent,
  onSelectEvent,
}: MapContainerProps) {
  const mapRef = useRef<MapRef>(null);

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Filter States
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<string>(
    new Date().toLocaleDateString("en-CA"),
  );
  const [timeFilter, setTimeFilter] = useState<string>("");
  const { resolvedTheme } = useTheme();
  const mapStyle = MAP_STYLES[(resolvedTheme as ThemeOption) ?? "light"];

  useEffect(() => {
    if (!selectedEvent || !mapRef.current) return;

    mapRef.current.flyTo({
      center: [selectedEvent.longitude, selectedEvent.latitude],
      zoom: 15,
      pitch: 45,
      essential: true,
      duration: 1800,
    });
  }, [selectedEvent]);

  const handleMapClick = (e: any) => {
    onSelectEvent(null);
  };

  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setIsLocating(false);

        mapRef.current?.flyTo({
          center: [longitude, latitude],
          zoom: 14,
          pitch: 0,
          duration: 1500,
        });
      },
      (error) => {
        console.error("Error obtaining location", error);
        alert(
          "Unable to retrieve your location. Please check your permissions.",
        );
        setIsLocating(false);
      },
    );
  };

  const filteredEvents = events.filter((event) => {
    if (categoryFilter !== "ALL" && event.category !== categoryFilter)
      return false;

    if (typeFilter !== "ALL" && event.eventType !== typeFilter) return false;

    if (dateFilter && event.startTime.split("T")[0] !== dateFilter)
      return false;
    if (timeFilter && !event.startTime?.includes(timeFilter)) return false;

    return true;
  });

  return (
    <div className="w-full h-full relative bg-muted">
      <div className="absolute top-6 left-6 pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)] z-10 flex flex-col gap-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              size="icon"
              variant="secondary"
              className="w-12 h-12 rounded-full"
            >
              <Filter className="w-5 h-5" />
            </Button>
          </DialogTrigger>
          {/* Mobile responsive adjustments: w-[95vw], max-h bounds, padding adjustments */}
          <DialogContent className="w-[95vw] max-w-106.25 p-4 sm:p-6 max-h-[90vh] overflow-y-auto rounded-xl">
            <DialogHeader>
              <DialogTitle>Filter Events</DialogTitle>
              <DialogDescription>
                Narrow down the map to find exactly what you're looking for.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-2">
              <div className="grid gap-2.5">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
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

              <div className="grid gap-2.5">
                <Label htmlFor="type">Event Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="ALL">All Types</SelectItem>
                      <SelectItem value="COMMUNITY">Community</SelectItem>
                      <SelectItem value="VENUE">Venue</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Stack vertically on mobile, side-by-side on sm screens and up */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2.5">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full max-w-80 text-base sm:text-sm" // prevents iOS auto-zoom
                  />
                </div>
                {/* <div className="grid gap-2.5">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="w-full max-w-80 text-base sm:text-sm"
                  />
                </div> */}
              </div>

              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={() => {
                  setCategoryFilter("ALL");
                  setTypeFilter("ALL");
                  setDateFilter("");
                  setTimeFilter("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button
          size="icon"
          onClick={handleLocateUser}
          disabled={isLocating}
          variant="secondary"
          className={`w-12 h-12 rounded-full`}
        >
          <Navigation
            className={`w-5 h-5 ${isLocating ? "animate-pulse text-blue-500" : ""}`}
          />
        </Button>
      </div>

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
        onClick={handleMapClick}
      >
        {userLocation && (
          <Marker longitude={userLocation.lng} latitude={userLocation.lat}>
            <div className="relative flex h-6 w-6 items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-40 animate-ping" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600 border-2 border-white shadow-md" />
            </div>
          </Marker>
        )}

        {filteredEvents.map((event) => {
          const accentColor =
            CATEGORY_COLORS[event.category] || CATEGORY_COLORS["OTHER"];
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
                <div className="relative flex h-10 w-10 items-center justify-center cursor-pointer group">
                  <span
                    className="absolute inline-flex h-full w-full rounded-full opacity-20 animate-ping"
                    style={{ backgroundColor: accentColor }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-3.5 w-3.5 border-2 border-[var(--border)] shadow-sm transition-transform duration-300 group-hover:scale-125"
                    style={{
                      backgroundColor: accentColor,
                      transform: isSelected ? "scale(1.25)" : undefined,
                    }}
                  />
                </div>
              </Marker>

              {isSelected && (
                <Popup
                  longitude={event.longitude}
                  latitude={event.latitude}
                  offset={12}
                  closeButton={false}
                  closeOnClick={false}
                  anchor="bottom"
                  className="custom-popup"
                >
                  <div className="bg-popover text-popover-foreground p-4 rounded-xl shadow-xl border border-border min-w-55 font-sans">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: accentColor }}
                      />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {event.category}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm leading-tight text-foreground">
                      {event.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {event.locationString}
                    </p>
                    <div className="mt-2.5 pt-2 border-t border-border text-[11px] font-medium text-foreground flex justify-between">
                      <span>{formatDate(event.startTime)}</span>
                    </div>
                  </div>
                </Popup>
              )}
            </div>
          );
        })}
      </Map>
    </div>
  );
}

const formatDate = (isoString: string) => {
  const date = new Date(isoString);

  return new Intl.DateTimeFormat("en-US", {
    month: "short", // "Jul"
    day: "numeric", // "3"

    hour: "numeric", // "9"
    minute: "2-digit", // "00"
    hour12: false, // Use AM/PM
  }).format(date);
};
