import { CATEGORY_META } from "@/constants/event";
import { EventCategory, EventResponse } from "@/types/event";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { CalendarDays, Clock, Layers, MapPin } from "lucide-react";
import Image from "next/image";

const DESC_TRUNCATE = 90; // characters shown in card before "…"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncate(str: string | undefined, max: number) {
  if (!str) return "";
  return str.length <= max ? str : str.slice(0, max).trimEnd() + "…";
}

// ─── Category image placeholder (compact, for card) ───────────────────────────

function CategoryThumb({ event }: { event: EventResponse }) {
  const meta = CATEGORY_META[event.category];
  return (
    <div
      className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${meta.bgClass} overflow-hidden`}
    >
      {event.imageUrl ? (
        <Image alt={event.title} fill src={event.imageUrl} priority />
      ) : (
        <span className="text-xl select-none leading-none">{meta.emoji}</span>
      )}
    </div>
  );
}

export function EventCard({
  event,
  onClick,
}: {
  event: EventResponse;
  onClick?: () => void;
}) {
  const cat = CATEGORY_META[event.category];

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      className="group relative overflow-hidden border border-border bg-card transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 flex flex-col cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Left accent strip */}
      <div className="absolute left-0 top-0 h-full w-1 bg-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100 rounded-l-md" />

      <CardContent className="p-4 sm:p-5 flex flex-col flex-1">
        {/* ── Header: thumb + title + badge ── */}
        <div className="mb-3 flex items-start gap-3">
          <CategoryThumb event={event} />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-card-foreground leading-snug text-[15px] line-clamp-2 flex-1">
                {event.title}
              </h3>
              <Badge
                variant="outline"
                className={`shrink-0 text-[10px] font-medium px-2 py-0.5 leading-tight ${cat.badgeClass}`}
              >
                {cat.label}
              </Badge>
            </div>
          </div>
        </div>

        {/* ── Description (truncated) ── */}
        {event.description && (
          <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
            {truncate(event.description, DESC_TRUNCATE)}
          </p>
        )}

        <Separator className="mb-3" />

        {/* ── Meta ── */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <CalendarDays size={12} className="shrink-0" />
            <span>{formatDate(event.startTime)}</span>
            <span className="text-muted-foreground/40">·</span>
            <Clock size={12} className="shrink-0" />
            <span>{formatTime(event.startTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <MapPin size={12} className="shrink-0" />
            <span className="line-clamp-1">{event.locationString}</span>
          </div>
        </div>

        {/* ── Footer chip ── */}
        <div className="mt-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            <Layers size={10} />
            {event.eventType === "COMMUNITY" ? "Community" : "Venue"}
          </span>
          <span className="text-[11px] text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
            View details →
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
