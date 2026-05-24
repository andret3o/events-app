"use client";

/**
 * EventDialog — reusable event detail dialog.
 *
 * Usage:
 *   <EventDialog
 *     event={event}
 *     currentUserId={currentUserId}   // null if not logged in
 *     open={open}
 *     onOpenChange={setOpen}
 *   />
 *
 * The dialog is fully self-contained. Can be imported on any page (events list,
 * map, profile, etc.) and pass the event + open state.
 */

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CalendarDays,
  Clock,
  MapPin,
  Map,
  Pencil,
  Layers,
  Tag,
  ImageIcon,
} from "lucide-react";
import { EventCategory, EventResponse } from "@/types/event";
import { CATEGORY_META } from "@/constants/event";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EventDialogProps {
  event: EventResponse | null;
  /** ID of the currently logged-in user. Pass null if unauthenticated. */
  currentUserId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isSameDay(a: string, b: string) {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

// ─── Image placeholder ────────────────────────────────────────────────────────

function EventImagePlaceholder({ category }: { category: EventCategory }) {
  const meta = CATEGORY_META[category];
  return (
    // Gradient background derived from the category colour — swap for a real
    // <Image> tag once the backend provides image URLs.
    <div
      className={`relative flex h-full w-full items-center justify-center bg-gradient-to-br ${meta.bgClass}`}
    >
      {/* Decorative blurred blob */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        {/* <span className="text-[120px] blur-2xl select-none">{meta.emoji}</span> */}
      </div>
      {/* Foreground icon + label */}
      <div className="relative flex flex-col items-center gap-2 text-muted-foreground">
        {/* <span className="text-5xl select-none">{meta.emoji}</span> */}
        <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest opacity-60">
          <ImageIcon size={11} />
          No image yet
        </span>
      </div>
    </div>
  );
}

// ─── Detail row ───────────────────────────────────────────────────────────────

function DetailRow({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </span>
      <div className="flex-1 text-sm text-foreground leading-relaxed">
        {children}
      </div>
    </div>
  );
}

// ─── Dialog ───────────────────────────────────────────────────────────────────

export function EventDialog({
  event,
  currentUserId,
  open,
  onOpenChange,
}: EventDialogProps) {
  const router = useRouter();

  if (!event) return null;

  const cat = CATEGORY_META[event.category as EventCategory];
  const sameDay = isSameDay(event.startTime, event.endTime);
  // Ownership check — wire up event.ownerId once the backend returns it.
  // For now this is a placeholder: replace `event.ownerId` with the real field.
  const isOwner =
    currentUserId !== null &&
    "ownerId" in event &&
    (event as EventResponse & { ownerId?: number }).ownerId === currentUserId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card p-0
          sm:max-w-xl
          max-h-[90dvh] flex flex-col
        "
      >
        {/* ── Image area ── */}
        <div className="relative h-48 w-full shrink-0 overflow-hidden sm:h-56">
          <EventImagePlaceholder category={event.category as EventCategory} />

          {/* Category badge — floated over image */}
          <div className="absolute left-4 bottom-4">
            <Badge
              variant="outline"
              className={`text-xs font-semibold px-2.5 py-1 backdrop-blur-sm bg-background/80 border ${cat.badgeClass}`}
            >
              {cat.emoji} {cat.label}
            </Badge>
          </div>

          {/* Type chip */}
          <div className="absolute right-4 bottom-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border px-2.5 py-1 text-[11px] font-medium text-foreground">
              <Layers size={10} />
              {event.eventType === "COMMUNITY" ? "Community" : "Venue"}
            </span>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-5 sm:px-6 sm:py-6 space-y-5">
            {/* Title + action buttons */}
            <div className="flex items-start justify-between gap-3">
              <DialogHeader className="flex-1 space-y-0">
                <DialogTitle className="text-xl font-bold leading-snug text-foreground sm:text-2xl">
                  {event.title}
                </DialogTitle>
              </DialogHeader>

              {/* Action buttons */}
              <div className="flex shrink-0 items-center gap-2">
                {/* View on Map — no action yet, reserved for future */}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-muted-foreground"
                  title="View on map (coming soon)"
                  disabled
                >
                  <Map size={15} />
                </Button>

                {/* Edit — only shown to the event owner */}
                {isOwner && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 rounded-lg text-sm"
                    onClick={() => {
                      onOpenChange(false);
                      router.push(`/events/${event.id}/edit`);
                    }}
                  >
                    <Pencil size={13} />
                    Edit
                  </Button>
                )}
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {event.description}
              </p>
            )}

            <Separator />

            {/* Detail rows */}
            <div className="space-y-3">
              {/* Date(s) */}
              <DetailRow icon={<CalendarDays size={14} />}>
                {sameDay ? (
                  <span>{formatDate(event.startTime)}</span>
                ) : (
                  <span>
                    {formatDate(event.startTime)}
                    <span className="mx-1.5 text-muted-foreground">→</span>
                    {formatDate(event.endTime)}
                  </span>
                )}
              </DetailRow>

              {/* Time */}
              <DetailRow icon={<Clock size={14} />}>
                <span>
                  {formatTime(event.startTime)}
                  {" – "}
                  {formatTime(event.endTime)}
                  {!sameDay && (
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      (multi-day)
                    </span>
                  )}
                </span>
              </DetailRow>

              {/* Location */}
              <DetailRow icon={<MapPin size={14} />}>
                <span className="leading-relaxed">{event.locationString}</span>
              </DetailRow>
            </div>

            {/* Coordinates — subtle footer detail */}
            <div className="rounded-lg bg-muted/50 px-3 py-2 flex items-center justify-between">
              <span className="text-[11px] font-mono text-muted-foreground">
                {event.latitude.toFixed(5)}, {event.longitude.toFixed(5)}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/60">
                <Tag size={10} />#{event.id}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
