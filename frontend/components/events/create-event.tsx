"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
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
  ImagePlus,
  X,
  Upload,
} from "lucide-react";
import { createEvent } from "@/lib/api/event";
import { EventCategory } from "@/types/event";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

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

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_MB = 5;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toInstant(localDatetime: string) {
  return new Date(localDatetime).toISOString();
}

function shortAddress(r: NominatimResult) {
  const a = r.address;
  return [
    a.road && a.house_number ? `${a.road} ${a.house_number}` : a.road,
    a.neighbourhood ?? a.quarter ?? a.suburb,
    a.city,
    a.postcode,
  ]
    .filter(Boolean)
    .join(", ");
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── LocationResult ───────────────────────────────────────────────────────────

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
            : "border-border bg-card hover:bg-muted"
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

// ─── Section ──────────────────────────────────────────────────────────────────

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
      <div className="flex flex-col items-center">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground sm:h-8 sm:w-8 sm:border-2 sm:border-primary sm:bg-primary/5 sm:text-xs sm:text-primary">
          {step}
        </div>
        {!isLast && (
          <div className="mt-2 w-px flex-1 bg-border hidden sm:block" />
        )}
      </div>
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

// ─── ImageUpload ──────────────────────────────────────────────────────────────

function ImageUpload({
  preview,
  fileName,
  fileSize,
  onFileChange,
  onClear,
  error,
}: {
  preview: string | null;
  fileName: string | null;
  fileSize: number | null;
  onFileChange: (file: File) => void;
  onClear: () => void;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFile(file: File) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Please upload a JPEG, PNG, WebP, or GIF image.", {
        position: "top-center",
      });
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`Image must be smaller than ${MAX_MB} MB.`, {
        position: "top-center",
      });
      return;
    }
    onFileChange(file);
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [onFileChange],
  );

  if (preview) {
    return (
      <div className="space-y-2">
        <div className="relative overflow-hidden rounded-xl border border-border">
          {/* Preview */}
          <div className="relative h-48 w-full sm:h-56 bg-muted">
            <Image
              src={preview}
              alt="Event image preview"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 672px"
            />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          {/* File info bar over image */}
          <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-xs font-medium text-white line-clamp-1">
                {fileName}
              </p>
              <p className="text-[10px] text-white/60">
                {fileSize !== null ? formatBytes(fileSize) : ""}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-1 text-[10px] font-medium text-white hover:bg-white/30 transition-colors"
              >
                <Upload size={10} />
                Replace
              </button>
              <button
                type="button"
                onClick={onClear}
                aria-label="Remove image"
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          w-full rounded-xl border-2 border-dashed px-6 py-10
          flex flex-col items-center gap-3 transition-all duration-150 text-center
          ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.01]"
              : error
                ? "border-destructive/40 bg-destructive/5 hover:border-destructive/60"
                : "border-border bg-card hover:border-primary/40 hover:bg-muted/50"
          }
        `}
      >
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors
          ${isDragging ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
        >
          <ImagePlus size={20} />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {isDragging ? "Drop it here" : "Upload event image"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Drag & drop or click · JPEG, PNG, WebP, GIF · Max {MAX_MB} MB
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors">
          <Upload size={11} />
          Choose file
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [addressQuery, setAddressQuery] = useState("");
  const [locationResults, setLocationResults] = useState<NominatimResult[]>([]);
  const [selectedLocation, setSelectedLocation] =
    useState<NominatimResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  // ── Image ────────────────────────────────────────────────────────────────

  function handleImageFile(file: File) {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors((p) => ({ ...p, image: undefined }));
  }

  function clearImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  }

  // ── Location search ──────────────────────────────────────────────────────

  async function handleLocationSearch() {
    if (!addressQuery.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    setLocationResults([]);
    setSelectedLocation(null);
    try {
      const params = new URLSearchParams({
        q: addressQuery.trim(),
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
      if (!res.ok) throw new Error();
      const data: NominatimResult[] = await res.json();
      data.length === 0
        ? setSearchError("No results found. Try a different search term.")
        : setLocationResults(data);
    } catch {
      setSearchError("Could not reach the location service. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }

  // ── Validation ───────────────────────────────────────────────────────────

  function validate() {
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

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!validate() || !selectedLocation || !category) return;

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("category", category);
    formData.append(
      "locationString",
      [
        selectedLocation.name,
        selectedLocation.address.road,
        selectedLocation.address.house_number,
        selectedLocation.address.city,
      ]
        .filter(Boolean)
        .join(", "),
    );
    formData.append("latitude", selectedLocation.lat);
    formData.append("longitude", selectedLocation.lon);
    formData.append("startTime", toInstant(startTime));
    formData.append("endTime", toInstant(endTime));
    if (imageFile) formData.append("image", imageFile);

    setIsSubmitting(true);
    const res = await createEvent(formData);

    if (!res.success) {
      setErrors({ form: "Failed to create event. " + res.message });
    } else {
      clearImage();
      toast.success((res.data?.title ?? "Event") + " created successfully!", {
        position: "top-center",
      });
      router.push("/profile");
    }
    setIsSubmitting(false);
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Header */}
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

        <form onSubmit={handleSubmit} noValidate>
          <Card className="border border-border bg-card shadow-sm overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/60 to-primary/30" />
            <CardContent className="p-4 sm:p-6 lg:p-8">
              {/* Step 1 — Basics */}
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

              {/* Step 2 — Category */}
              <Section step={2} title="Category" icon={<Tag size={13} />}>
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                  {CATEGORIES.map((cat) => {
                    const active = category === cat.value;
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setCategory(cat.value)}
                        className={`flex flex-col items-center gap-1 rounded-lg border px-1 py-2.5 sm:px-3 sm:py-3 text-center transition-all duration-150
                          ${active ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border bg-card hover:bg-muted"}`}
                      >
                        <span className="text-lg sm:text-xl leading-none">
                          {cat.emoji}
                        </span>
                        <span
                          className={`text-[10px] sm:text-xs font-medium leading-tight ${active ? "text-primary" : "text-foreground"}`}
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

              {/* Step 3 — Image */}
              <Section step={3} title="Image" icon={<ImagePlus size={13} />}>
                <ImageUpload
                  preview={imagePreview}
                  fileName={imageFile?.name ?? null}
                  fileSize={imageFile?.size ?? null}
                  onFileChange={handleImageFile}
                  onClear={clearImage}
                  error={errors.image}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Optional — adds a cover photo to your event card.
                </p>
              </Section>

              <Separator className="my-1" />

              {/* Step 4 — Location */}
              <Section step={4} title="Location" icon={<MapPin size={13} />}>
                <div className="space-y-2.5">
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

              {/* Step 5 — Date & Time */}
              <Section
                step={5}
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

              {errors.form && (
                <p className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {errors.form}
                </p>
              )}

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
