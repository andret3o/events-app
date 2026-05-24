"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CalendarDays,
  Plus,
  Pencil,
  ArrowRight,
  User,
  Mail,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { EventCard } from "@/components/events/event-card";
import { EventDialog } from "@/components/events/event-dialog";
import { EventResponse } from "@/types/event";
import { UserResponse, Role } from "@/types/user";
import { PageableResponse } from "@/types/types";
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

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProfilePageProps {
  user: UserResponse;
  eventsPage: PageableResponse<EventResponse>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_STYLES: Record<Role, { label: string; className: string }> = {
  USER: {
    label: "Member",
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

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage({ user, eventsPage }: ProfilePageProps) {
  const router = useRouter();

  const MAX_PREVIEW = 4;
  const previewEvents = eventsPage.content.slice(0, MAX_PREVIEW);
  const hasMore = eventsPage.totalElements > MAX_PREVIEW;
  const roleMeta = ROLE_STYLES[user.role];

  // ── Dialog state ────────────────────────────────────────────────────────
  const [dialogEvent, setDialogEvent] = useState<EventResponse | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  function openDialog(event: EventResponse) {
    setDialogEvent(event);
    setDialogOpen(true);
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          {/* ── Profile header card ── */}
          <Card className="mb-8 overflow-hidden border border-border bg-card shadow-sm">
            <div className="h-2 w-full bg-gradient-to-r from-primary via-primary/60 to-primary/30" />

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
                      <Badge
                        variant="outline"
                        className={`text-[11px] font-semibold px-2 py-0.5 ${roleMeta.className}`}
                      >
                        {roleMeta.label}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      @{user.username}
                    </p>

                    <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Mail size={12} />
                        {user.email}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User size={12} />
                        ID {user.id}
                      </span>
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
                        <AlertDialogTitle>Log out?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want logout?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel variant="outline">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={logout}
                          variant="destructive"
                        >
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
                  onClick={() => router.push("/events?tab=mine")}
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
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {previewEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onClick={() => openDialog(event)}
                    />
                  ))}
                </div>

                {hasMore && (
                  <button
                    onClick={() => router.push("/events?tab=mine")}
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
      </div>

      {/* Dialog — owns the user.id as currentUserId so Edit button shows correctly */}
      <EventDialog
        event={dialogEvent}
        currentUserId={user.id}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
