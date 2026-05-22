"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  MapPin,
  CalendarDays,
  ChevronRight,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Tag,
  Type,
} from "lucide-react";
import { createEvent } from "@/lib/api/event";
import { EventCategory, EventRequest } from "@/types/event";
import { toast } from "sonner";

interface NominatimResult {
  place_id: number;
  display_name: string;
  name: string;
  lat: string;
  lon: string;
  type: string;
  category: string;
  address: {
    road?: string;
    house_number?: string;
    neighbourhood?: string;
    quarter?: string;
    suburb?: string;
    city?: string;
    postcode?: string;
    country?: string;
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: { value: EventCategory; label: string; emoji: string }[] = [
  { value: "MUSIC", label: "Music", emoji: "🎵" },
  { value: "NIGHTLIFE", label: "Nightlife", emoji: "🌙" },
  { value: "TECH", label: "Tech", emoji: "💻" },
  { value: "SPORT", label: "Sport", emoji: "⚡" },
  { value: "SOCIAL", label: "Social", emoji: "🤝" },
  { value: "EDUCATIONAL", label: "Educational", emoji: "📚" },
  { value: "ART", label: "Art", emoji: "🎨" },
  { value: "OTHER", label: "Other", emoji: "✦" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toInstant(localDatetime: string): string {
  return new Date(localDatetime).toISOString();
}

function shortAddress(r: NominatimResult): string {
  const a = r.address;
  const parts = [
    a.road && a.house_number ? `${a.road} ${a.house_number}` : a.road,
    a.neighbourhood ?? a.quarter ?? a.suburb,
    a.city,
    a.postcode,
  ].filter(Boolean);
  return parts.join(", ");
}

// ─── Location result card ─────────────────────────────────────────────────────

function LocationResult({
  result,
  selected,
  onSelect,
}: {
  result: NominatimResult;
  selected: boolean;
  onSelect: (r: NominatimResult) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(result)}
      className={`w-full text-left rounded-lg border px-3 py-2.5 transition-all duration-150 flex items-start gap-2.5
        ${
          selected
            ? "border-primary bg-primary/5 ring-1 ring-primary/20"
            : "border-border bg-card hover:bg-muted hover:border-border"
        }`}
    >
      <div
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full
          ${selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
      >
        {selected ? <CheckCircle2 size={12} /> : <MapPin size={11} />}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground line-clamp-1">
          {result.name || result.display_name.split(",")[0]}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
          {shortAddress(result) || result.display_name}
        </p>
        <div className="mt-1 flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground capitalize">
            {result.type.replace(/_/g, " ")}
          </span>
          <span className="text-[10px] text-muted-foreground/60 font-mono">
            {parseFloat(result.lat).toFixed(4)},{" "}
            {parseFloat(result.lon).toFixed(4)}
          </span>
        </div>
      </div>

      <ChevronRight
        size={13}
        className={`mt-1 shrink-0 transition-opacity ${selected ? "opacity-100 text-primary" : "opacity-0"}`}
      />
    </button>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  step,
  title,
  icon,
  children,
  isLast = false,
}: {
  step: number;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div className="flex gap-3 sm:gap-6">
      {/* Step indicator column */}
      <div className="flex flex-col items-center">
        {/* Mobile: small filled badge. Desktop: original bordered circle */}
        <div
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground
                        sm:h-8 sm:w-8 sm:border-2 sm:border-primary sm:bg-primary/5 sm:text-xs sm:font-bold sm:text-primary"
        >
          {step}
        </div>
        {/* Connector line — hidden on mobile to save space, visible on desktop */}
        {!isLast && (
          <div className="mt-2 w-px flex-1 bg-border hidden sm:block" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6 sm:pb-8 min-w-0">
        <div className="mb-3 sm:mb-4 flex items-center gap-2">
          <span className="text-muted-foreground">{icon}</span>
          <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {title}
          </h2>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CreateEventPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<EventCategory | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [addressQuery, setAddressQuery] = useState("");
  const [locationResults, setLocationResults] = useState<NominatimResult[]>([]);
  const [selectedLocation, setSelectedLocation] =
    useState<NominatimResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  // ── Location search ──────────────────────────────────────────────────────

  async function handleLocationSearch() {
    if (!addressQuery.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    setLocationResults([]);
    setSelectedLocation(null);

    try {
      const params = new URLSearchParams({
        q: `${addressQuery.trim()}`,
        format: "json",
        addressdetails: "1",
        limit: "5",
        countrycodes: "ee",
      });
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?${params}`,
        {
          headers: {
            "Accept-Language": "en",
            "User-Agent": "Events Student WebApp",
          },
        },
      );
      if (!res.ok) throw new Error("Search failed");
      const data: NominatimResult[] = await res.json();
      if (data.length === 0) {
        setSearchError("No results found. Try a different search term.");
      } else {
        setLocationResults(data);
      }
    } catch {
      setSearchError("Could not reach the location service. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }

  // ── Validation ───────────────────────────────────────────────────────────

  function validate(): boolean {
    const e: Partial<Record<string, string>> = {};
    if (!title.trim()) e.title = "Title is required.";
    if (!category) e.category = "Please select a category.";
    if (!selectedLocation) e.location = "Please search and select a location.";
    if (!startTime) e.startTime = "Start time is required.";
    if (!endTime) e.endTime = "End time is required.";
    if (startTime && endTime && new Date(endTime) <= new Date(startTime))
      e.endTime = "End time must be after start time.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Submit ───────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || !selectedLocation || !category) return;

    const req: EventRequest = {
      title: title.trim(),
      description: description.trim(),
      category,
      locationString: selectedLocation.display_name,
      latitude: parseFloat(selectedLocation.lat),
      longitude: parseFloat(selectedLocation.lon),
      startTime: toInstant(startTime),
      endTime: toInstant(endTime),
    };

    setIsSubmitting(true);

    const res = await createEvent(req);

    if (!res.success) {
      setErrors({ form: "Failed to create event. " + res.message });
    } else {
      toast.success(
        (res.data ? res.data.title : "Event") + " created successfully!",
        { position: "top-center" },
      );
      router.push("/profile");
    }

    setIsSubmitting(false);
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
        {/* ── Header ── */}
        <div className="mb-6 sm:mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={15} />
            Back
          </button>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
            Create Event
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Fill in the details below and your event will be live.
          </p>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} noValidate>
          <Card className="border border-border bg-card shadow-sm overflow-hidden">
            {/* Top accent */}
            <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/60 to-primary/30" />

            <CardContent className="p-4 sm:p-6 lg:p-8">
              {/* ── Step 1: Basics ── */}
              <Section step={1} title="Basics" icon={<Type size={13} />}>
                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="title"
                      className="text-sm font-medium text-foreground"
                    >
                      Event title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g. Jazz Night at Telliskivi"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className={
                        errors.title
                          ? "border-destructive focus-visible:ring-destructive/30"
                          : ""
                      }
                    />
                    {errors.title && (
                      <p className="text-xs text-destructive">{errors.title}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="description"
                      className="text-sm font-medium text-foreground"
                    >
                      Description{" "}
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        (optional)
                      </span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Tell people what to expect…"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                </div>
              </Section>

              <Separator className="my-1" />

              {/* ── Step 2: Category ── */}
              <Section step={2} title="Category" icon={<Tag size={13} />}>
                {/* 4 columns on all sizes — compact pill style on mobile */}
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                  {CATEGORIES.map((cat) => {
                    const active = category === cat.value;
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setCategory(cat.value)}
                        className={`flex flex-col items-center gap-1 rounded-lg border px-1 py-2.5 sm:px-3 sm:py-3 text-center transition-all duration-150
                          ${
                            active
                              ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                              : "border-border bg-card hover:bg-muted"
                          }`}
                      >
                        <span className="text-lg sm:text-xl leading-none">
                          {cat.emoji}
                        </span>
                        <span
                          className={`text-[10px] sm:text-xs font-medium leading-tight ${
                            active ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {cat.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {errors.category && (
                  <p className="mt-2 text-xs text-destructive">
                    {errors.category}
                  </p>
                )}
              </Section>

              <Separator className="my-1" />

              {/* ── Step 3: Location ── */}
              <Section step={3} title="Location" icon={<MapPin size={13} />}>
                <div className="space-y-2.5">
                  {/* Search row — stacked on mobile, side-by-side on sm+ */}
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      placeholder="Search an address in Tallinn…"
                      value={addressQuery}
                      onChange={(e) => setAddressQuery(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), handleLocationSearch())
                      }
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="default"
                      onClick={handleLocationSearch}
                      disabled={isSearching || !addressQuery.trim()}
                      className="w-full sm:w-auto shrink-0 gap-2"
                    >
                      {isSearching ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Search size={14} />
                      )}
                      Search
                    </Button>
                  </div>

                  {searchError && (
                    <p className="text-xs text-destructive">{searchError}</p>
                  )}

                  {locationResults.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">
                        {locationResults.length} result
                        {locationResults.length !== 1 ? "s" : ""} — select the
                        correct one
                      </p>
                      {locationResults.map((r) => (
                        <LocationResult
                          key={r.place_id}
                          result={r}
                          selected={selectedLocation?.place_id === r.place_id}
                          onSelect={setSelectedLocation}
                        />
                      ))}
                    </div>
                  )}

                  {selectedLocation && (
                    <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5">
                      <CheckCircle2
                        size={13}
                        className="shrink-0 text-primary"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground line-clamp-1">
                          {selectedLocation.name ||
                            selectedLocation.display_name.split(",")[0]}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-mono truncate">
                          {parseFloat(selectedLocation.lat).toFixed(5)},{" "}
                          {parseFloat(selectedLocation.lon).toFixed(5)}
                        </p>
                      </div>
                    </div>
                  )}

                  {errors.location && (
                    <p className="text-xs text-destructive">
                      {errors.location}
                    </p>
                  )}
                </div>
              </Section>

              <Separator className="my-1" />

              {/* ── Step 4: Date & Time ── */}
              <Section
                step={4}
                title="Date & Time"
                icon={<CalendarDays size={13} />}
                isLast
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  <div className="space-y-1.5 max-w-59">
                    <Label
                      htmlFor="startTime"
                      className="text-sm font-medium text-foreground"
                    >
                      Starts <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className={
                        errors.startTime
                          ? "border-destructive focus-visible:ring-destructive/30"
                          : ""
                      }
                    />
                    {errors.startTime && (
                      <p className="text-xs text-destructive">
                        {errors.startTime}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5 max-w-59">
                    <Label
                      htmlFor="endTime"
                      className="text-sm font-medium text-foreground"
                    >
                      Ends <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      value={endTime}
                      min={startTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className={
                        errors.endTime
                          ? "border-destructive focus-visible:ring-destructive/30"
                          : ""
                      }
                    />
                    {errors.endTime && (
                      <p className="text-xs text-destructive">
                        {errors.endTime}
                      </p>
                    )}
                  </div>
                </div>
              </Section>

              {/* ── Form error ── */}
              {errors.form && (
                <p className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {errors.form}
                </p>
              )}

              {/* ── Submit ── */}
              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="gap-2 w-full sm:w-auto sm:min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Publishing…
                    </>
                  ) : (
                    "Publish Event"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        <p className="mt-4 text-center text-[11px] text-muted-foreground/60">
          Location data © OpenStreetMap contributors via Nominatim
        </p>
      </div>
      <div className="h-20" aria-hidden="true" />
    </div>
  );
}
