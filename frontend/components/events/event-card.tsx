import { CATEGORY_META } from "@/constants/event";
import { EventCategory, EventResponse } from "@/types/event";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { CalendarDays, Clock, ImageIcon, Layers, MapPin } from "lucide-react";
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

function EventImagePlaceholder({ category }: { category: EventCategory }) {
  const meta = CATEGORY_META[category];
  return (
    <div
      className={`relative z-20 flex aspect-video w-full items-center justify-center bg-gradient-to-br ${meta.bgClass}`}
    >
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest opacity-60">
          <ImageIcon size={11} />
          No image
        </span>
      </div>
    </div>
  );
}

// ─── Refactored EventCard Component ───────────────────────────────────────────

export function EventCard({
  event,
  onClick,
}: {
  event: EventResponse;
  onClick?: () => void;
}) {
  const cat = CATEGORY_META[event.category];

  return (
    <Card onClick={onClick} className="relative mx-auto w-full max-w-sm pt-0">
      <div className="absolute inset-0 z-30 aspect-video bg-black/25" />
      {event.imageUrl ? (
        <img
          src={event.imageUrl}
          alt="Event cover"
          className="relative z-20 aspect-video w-full object-cover"
        />
      ) : (
        <EventImagePlaceholder category={event.category} />
      )}
      <CardHeader>
        <CardAction>
          <Badge variant="secondary" className={cat.badgeClass}>
            {cat.label}
          </Badge>
        </CardAction>
        <CardTitle>{event.title}</CardTitle>
        <CardDescription>
          {truncate(event.description, DESC_TRUNCATE)}
        </CardDescription>
      </CardHeader>
      <div className="h-full"></div>
      <Separator />
      <CardFooter>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <CalendarDays size={12} className="shrink-0" />
            <span>{formatDate(event.startTime)}</span>
            <span className="text-muted-foreground/40">·</span>
            <Clock size={12} className="shrink-0" />
            <span>{formatTime(event.startTime)}</span>
            <MapPin size={12} className="shrink-0" />
            <span className="line-clamp-1">{event.locationString}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
