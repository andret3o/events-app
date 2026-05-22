"use client";

import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CalendarDays,
  MapPin,
  Clock,
  Plus,
  Pencil,
  ArrowRight,
  Layers,
  Tag,
  User,
  Mail,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { Logout } from "@hugeicons/core-free-icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { logout } from "@/lib/api/auth";
import { Role, UserResponse } from "@/types/user";
import { PageableResponse } from "@/types/types";
import { EventCategory, EventResponse } from "@/types/event";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProfilePageProps {
  user: UserResponse;
  eventsPage: PageableResponse<EventResponse>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_STYLES: Record<
  EventCategory,
  { label: string; className: string }
> = {
  NIGHTLIFE: {
    label: "Nightlife",
    className:
      "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800",
  },
  MUSIC: {
    label: "Music",
    className:
      "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-800",
  },
  TECH: {
    label: "Tech",
    className:
      "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800",
  },
  SPORT: {
    label: "Sport",
    className:
      "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
  },
  SOCIAL: {
    label: "Social",
    className:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  },
  EDUCATIONAL: {
    label: "Educational",
    className:
      "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800",
  },
  ART: {
    label: "Art",
    className:
      "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
  },
  OTHER: {
    label: "Other",
    // No semantic colour — use theme muted tokens
    className: "bg-muted text-muted-foreground border-border",
  },
};

// Role badges: VENUE/ADMIN
const ROLE_STYLES: Record<Role, { label: string; className: string }> = {
  USER: {
    label: "User",
    className: "bg-muted text-muted-foreground border-border",
  },
  VENUE: {
    label: "Venue",
    className:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  },
  ADMIN: {
    label: "Admin",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EventCard({ event }: { event: EventResponse }) {
  const cat = CATEGORY_STYLES[event.category];

  return (
    <Card className="group relative overflow-hidden border border-border bg-card transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      {/* Accent strip — uses primary token so it adapts to theme */}
      <div className="absolute left-0 top-0 h-full w-1 bg-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100 rounded-l-md" />

      <CardContent className="p-5">
        {/* Header row */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 className="font-semibold text-card-foreground leading-snug text-[15px] line-clamp-2 flex-1">
            {event.title}
          </h3>
          <Badge
            variant="outline"
            className={`shrink-0 text-[11px] font-medium px-2 py-0.5 ${cat.className}`}
          >
            {cat.label}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4 leading-relaxed">
          {event.description}
        </p>

        <Separator className="mb-4" />

        {/* Meta */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <CalendarDays size={13} className="shrink-0" />
            <span>
              {formatDate(event.startTime)} — {formatDate(event.endTime)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <Clock size={13} className="shrink-0" />
            <span>
              {formatTime(event.startTime)} – {formatTime(event.endTime)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <MapPin size={13} className="shrink-0" />
            <span className="line-clamp-1">{event.locationString}</span>
          </div>
        </div>

        {/* Footer chips */}
        <div className="mt-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            <Layers size={10} />
            {event.eventType === "COMMUNITY" ? "Community" : "Venue"}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            <Tag size={10} />#{event.id}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage({ user, eventsPage }: ProfilePageProps) {
  const router = useRouter();

  const MAX_PREVIEW = 4;
  const previewEvents = eventsPage.content.slice(0, MAX_PREVIEW);
  const hasMore = eventsPage.totalElements > MAX_PREVIEW;
  const roleMeta = ROLE_STYLES[user.role];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* ── Profile header card ── */}
        <Card className="mb-8 overflow-hidden border border-border bg-card shadow-sm">
          {/* Decorative top band */}
          <div className="h-2 w-full bg-linear-to-r from-primary via-primary/60 to-primary/30" />

          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              {/* Left: avatar + identity */}
              <div className="flex items-start gap-5">
                <Avatar className="h-16 w-16 shrink-0 rounded-xl border-2 border-border shadow-sm sm:h-20 sm:w-20">
                  <AvatarFallback className="rounded-xl bg-primary text-primary-foreground text-xl font-bold tracking-tight">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                      {user.name}
                    </h1>
                    {roleMeta.label !== "User" && (
                      <Badge
                        variant="outline"
                        className={`text-[11px] font-semibold px-2 py-0.5 ${roleMeta.className}`}
                      >
                        {roleMeta.label}
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    @{user.username}
                  </p>

                  <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Mail size={12} />
                      {user.email}
                    </span>
                    {/* <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <User size={12} />
                      ID {user.id}
                    </span> */}
                    {user.role === "ADMIN" && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-destructive font-medium">
                        <ShieldCheck size={12} />
                        Administrator
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: action buttons */}
              <div className="flex shrink-0 flex-row gap-2 sm:flex-col sm:items-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => router.push("/profile/edit")}
                >
                  <Pencil size={14} />
                  Edit Profile
                </Button>
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => router.push("/events/new")}
                >
                  <Plus size={14} />
                  New Event
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="icon" variant="destructive">
                      <LogOut />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent size="sm" aria-describedby={undefined}>
                    <AlertDialogHeader>
                      {/* <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                        <Trash2Icon />
                      </AlertDialogMedia> */}
                      <AlertDialogTitle>Log out?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want logout?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel variant="outline">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={logout} variant="destructive">
                        Log out
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Events section ── */}
        <div>
          {/* Section header */}
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                My Events
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {eventsPage.totalElements === 0
                  ? "No events yet"
                  : `${eventsPage.totalElements} event${eventsPage.totalElements !== 1 ? "s" : ""} published`}
              </p>
            </div>

            {hasMore && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 font-medium"
                onClick={() => router.push("/profile/events")}
              >
                See all
                <ArrowRight size={14} />
              </Button>
            )}
          </div>

          {/* Empty state */}
          {eventsPage.empty ? (
            <Card className="border border-dashed border-border bg-card">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
                  <CalendarDays size={24} className="text-muted-foreground" />
                </div>
                <p className="text-base font-semibold text-foreground mb-1">
                  No events yet
                </p>
                <p className="text-sm text-muted-foreground mb-5 max-w-xs">
                  Start sharing what's happening. Create your first event and
                  let people find you.
                </p>
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => router.push("/events/new")}
                >
                  <Plus size={14} />
                  Create Event
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Events grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {previewEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>

              {/* "See all" footer strip */}
              {hasMore && (
                <button
                  onClick={() => router.push("/profile/events")}
                  className="mt-4 w-full rounded-xl border border-border bg-card py-3.5 text-sm font-medium text-muted-foreground transition-all duration-150 hover:bg-muted hover:text-foreground flex items-center justify-center gap-2"
                >
                  View all {eventsPage.totalElements} events
                  <ArrowRight size={14} />
                </button>
              )}
            </>
          )}
        </div>
      </div>
      <div className="h-20" aria-hidden="true" />
    </div>
  );
}
