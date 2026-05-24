"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  CalendarDays,
  Clock,
  MapPin,
  Layers,
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  Loader2,
  Plus,
} from "lucide-react";
import {
  getPagedEvents,
  getEventsByOwner,
  getEventsByCategory,
} from "@/lib/api/event";
import { EventCategory, EventResponse } from "@/types/event";
import { PageableResponse } from "@/types/types";
import { EventDialog } from "@/components/event-dialog";

// ─── Props ────────────────────────────────────────────────────────────────────

interface EventsPageProps {
  initialEvents: PageableResponse<EventResponse>;
  initialMyEvents: PageableResponse<EventResponse> | null;
  currentUserId: number | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 12;
const DESC_TRUNCATE = 90; // characters shown in card before "…"

export const CATEGORY_META: Record<
  EventCategory,
  { label: string; emoji: string; badgeClass: string; bgClass: string }
> = {
  NIGHTLIFE: {
    label: "Nightlife",
    emoji: "🌙",
    badgeClass:
      "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800",
    bgClass: "from-violet-500/20 to-violet-500/5",
  },
  MUSIC: {
    label: "Music",
    emoji: "🎵",
    badgeClass:
      "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-800",
    bgClass: "from-pink-500/20 to-pink-500/5",
  },
  TECH: {
    label: "Tech",
    emoji: "💻",
    badgeClass:
      "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800",
    bgClass: "from-sky-500/20 to-sky-500/5",
  },
  SPORT: {
    label: "Sport",
    emoji: "⚡",
    badgeClass:
      "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
    bgClass: "from-green-500/20 to-green-500/5",
  },
  SOCIAL: {
    label: "Social",
    emoji: "🤝",
    badgeClass:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
    bgClass: "from-amber-500/20 to-amber-500/5",
  },
  EDUCATIONAL: {
    label: "Educational",
    emoji: "📚",
    badgeClass:
      "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800",
    bgClass: "from-teal-500/20 to-teal-500/5",
  },
  ART: {
    label: "Art",
    emoji: "🎨",
    badgeClass:
      "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
    bgClass: "from-orange-500/20 to-orange-500/5",
  },
  OTHER: {
    label: "Other",
    emoji: "✦",
    badgeClass: "bg-muted text-muted-foreground border-border",
    bgClass: "from-muted/60 to-muted/10",
  },
};

const ALL_CATEGORIES = Object.keys(CATEGORY_META) as EventCategory[];

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

function CategoryThumb({ category }: { category: EventCategory }) {
  const meta = CATEGORY_META[category];
  return (
    <div
      className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${meta.bgClass} overflow-hidden`}
    >
      <span className="text-xl select-none leading-none">{meta.emoji}</span>
    </div>
  );
}

// ─── EventCard ────────────────────────────────────────────────────────────────
// Exported so profile.tsx can import it. Move to separate file later.
// Now accepts an onClick to open the dialog.

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
          <CategoryThumb category={event.category} />

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

// ─── FilterBar ────────────────────────────────────────────────────────────────

function FilterBar({
  search,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  showFilters,
  onToggleFilters,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  activeCategory: EventCategory | null;
  onCategoryChange: (c: EventCategory | null) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <Input
            placeholder="Search events…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-4 h-10"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <Button
          type="button"
          variant={showFilters || activeCategory ? "default" : "outline"}
          onClick={onToggleFilters}
          className="gap-2 shrink-0"
        >
          <SlidersHorizontal size={14} />
          <span className="hidden sm:inline">Filter</span>
          {activeCategory && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-foreground text-primary text-[10px] font-bold">
              1
            </span>
          )}
        </Button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-muted/40 p-3">
          <button
            type="button"
            onClick={() => onCategoryChange(null)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150
              ${
                !activeCategory
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-muted"
              }`}
          >
            All
          </button>
          {ALL_CATEGORIES.map((cat) => {
            const m = CATEGORY_META[cat];
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(active ? null : cat)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150
                  ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-muted"
                  }`}
              >
                <span>{m.emoji}</span>
                {m.label}
              </button>
            );
          })}
        </div>
      )}

      {activeCategory && !showFilters && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Filtered by:</span>
          <button
            type="button"
            onClick={() => onCategoryChange(null)}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary"
          >
            {CATEGORY_META[activeCategory].emoji}{" "}
            {CATEGORY_META[activeCategory].label}
            <X size={11} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── EventsGrid ───────────────────────────────────────────────────────────────

function EventsGrid({
  events,
  totalElements,
  totalPages,
  currentPage,
  isLoading,
  onLoadMore,
  onCardClick,
  emptyMessage,
  emptyAction,
}: {
  events: EventResponse[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  onLoadMore: () => void;
  onCardClick: (event: EventResponse) => void;
  emptyMessage: string;
  emptyAction?: React.ReactNode;
}) {
  const hasMore = currentPage + 1 < totalPages;

  if (!isLoading && events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center px-4">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
          <CalendarDays size={24} className="text-muted-foreground" />
        </div>
        <p className="text-base font-semibold text-foreground mb-1">
          {emptyMessage}
        </p>
        {emptyAction && <div className="mt-4">{emptyAction}</div>}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {totalElements > 0 && (
        <p className="text-xs text-muted-foreground">
          {totalElements} event{totalElements !== 1 ? "s" : ""}
          {hasMore ? ` — showing ${events.length}` : ""}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onClick={() => onCardClick(event)}
          />
        ))}

        {isLoading &&
          events.length === 0 &&
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border border-border bg-card">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
                  </div>
                </div>
                <div className="h-3 w-full rounded bg-muted animate-pulse" />
                <div className="h-3 w-5/6 rounded bg-muted animate-pulse" />
                <Separator className="my-3" />
                <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
              </CardContent>
            </Card>
          ))}
      </div>

      {(hasMore || (isLoading && events.length > 0)) && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={isLoading}
          className="mt-2 w-full rounded-xl border border-border bg-card py-3.5 text-sm font-medium text-muted-foreground transition-all duration-150 hover:bg-muted hover:text-foreground flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Loading…
            </>
          ) : (
            <>
              Load more
              <ChevronDown size={14} />
            </>
          )}
        </button>
      )}
    </div>
  );
}

// ─── TabButton ────────────────────────────────────────────────────────────────

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap
        ${
          active
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
    >
      {children}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary" />
      )}
    </button>
  );
}

// ─── Tab state ────────────────────────────────────────────────────────────────

interface TabState {
  events: EventResponse[];
  totalElements: number;
  totalPages: number;
  page: number;
  search: string;
  category: EventCategory | null;
  showFilters: boolean;
  loading: boolean;
}

function initialTabState(
  data: PageableResponse<EventResponse> | null,
): TabState {
  return {
    events: data?.content ?? [],
    totalElements: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 0,
    page: 0,
    search: "",
    category: null,
    showFilters: false,
    loading: false,
  };
}

type Tab = "all" | "mine";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EventsPage({
  initialEvents,
  initialMyEvents,
  currentUserId,
}: EventsPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabBarRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = currentUserId !== null;
  const initialTab = (searchParams.get("tab") as Tab) ?? "all";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  const [allState, setAllState] = useState<TabState>(() =>
    initialTabState(initialEvents),
  );
  const [myState, setMyState] = useState<TabState>(() =>
    initialTabState(initialMyEvents),
  );

  // ── Dialog state ─────────────────────────────────────────────────────────
  const [dialogEvent, setDialogEvent] = useState<EventResponse | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  function openDialog(event: EventResponse) {
    setDialogEvent(event);
    setDialogOpen(true);
  }

  // ── Tab switch ───────────────────────────────────────────────────────────
  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    tabBarRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  // ── Re-fetch all events when filters change ──────────────────────────────
  const refetchAll = useCallback(
    async (search: string, category: EventCategory | null) => {
      setAllState((s) => ({ ...s, loading: true, events: [], page: 0 }));
      try {
        const res = category
          ? await getEventsByCategory(category)
          : await getPagedEvents(0, PAGE_SIZE);
        if (!res.success || !res.data) return;
        setAllState((s) => ({
          ...s,
          events: res.data!.content,
          totalElements: res.data!.totalElements,
          totalPages: res.data!.totalPages,
          page: 0,
        }));
      } finally {
        setAllState((s) => ({ ...s, loading: false }));
      }
    },
    [],
  );

  const refetchMine = useCallback(
    async (search: string, category: EventCategory | null, userId: number) => {
      setMyState((s) => ({ ...s, loading: true, events: [], page: 0 }));
      try {
        const res = await getEventsByOwner(userId, 0, PAGE_SIZE);
        if (!res.success || !res.data) return;
        const filtered = category
          ? res.data.content.filter((e) => e.category === category)
          : res.data.content;
        const searchLower = search.toLowerCase();
        const searched = search
          ? filtered.filter(
              (e) =>
                e.title.toLowerCase().includes(searchLower) ||
                e.description?.toLowerCase().includes(searchLower),
            )
          : filtered;
        setMyState((s) => ({
          ...s,
          events: searched,
          totalElements: res.data!.totalElements,
          totalPages: res.data!.totalPages,
          page: 0,
        }));
      } finally {
        setMyState((s) => ({ ...s, loading: false }));
      }
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    const delay = allState.search ? 350 : 0;
    const timeout = setTimeout(async () => {
      if (cancelled) return;
      await refetchAll(allState.search, allState.category);
    }, delay);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allState.search, allState.category]);

  useEffect(() => {
    if (!isAuthenticated || !currentUserId) return;
    let cancelled = false;
    const delay = myState.search ? 350 : 0;
    const timeout = setTimeout(async () => {
      if (cancelled) return;
      await refetchMine(myState.search, myState.category, currentUserId);
    }, delay);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myState.search, myState.category, isAuthenticated]);

  // ── Load more ────────────────────────────────────────────────────────────
  async function loadMoreAll() {
    if (allState.loading) return;
    setAllState((s) => ({ ...s, loading: true }));
    try {
      const nextPage = allState.page + 1;
      const res = await getPagedEvents(nextPage, PAGE_SIZE);
      if (!res.success || !res.data) return;
      setAllState((s) => ({
        ...s,
        events: [...s.events, ...res.data!.content],
        totalElements: res.data!.totalElements,
        totalPages: res.data!.totalPages,
        page: nextPage,
      }));
    } finally {
      setAllState((s) => ({ ...s, loading: false }));
    }
  }

  async function loadMoreMine() {
    if (!currentUserId || myState.loading) return;
    setMyState((s) => ({ ...s, loading: true }));
    try {
      const nextPage = myState.page + 1;
      const res = await getEventsByOwner(currentUserId, nextPage, PAGE_SIZE);
      if (!res.success || !res.data) return;
      setMyState((s) => ({
        ...s,
        events: [...s.events, ...res.data!.content],
        totalElements: res.data!.totalElements,
        totalPages: res.data!.totalPages,
        page: nextPage,
      }));
    } finally {
      setMyState((s) => ({ ...s, loading: false }));
    }
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {/* ── Header ── */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Events
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Discover what's happening in Tallinn
              </p>
            </div>
            {isAuthenticated && (
              <Button
                size="sm"
                className="gap-2 self-start sm:self-auto shrink-0"
                onClick={() => router.push("/events/new")}
              >
                <Plus size={14} />
                New Event
              </Button>
            )}
          </div>

          {/* ── Tabs ── */}
          <div ref={tabBarRef} className="mb-6">
            <div className="flex border-b border-border gap-1 overflow-x-auto">
              <TabButton
                active={activeTab === "all"}
                onClick={() => switchTab("all")}
              >
                All Events
              </TabButton>
              {isAuthenticated && (
                <TabButton
                  active={activeTab === "mine"}
                  onClick={() => switchTab("mine")}
                >
                  My Events
                  {myState.totalElements > 0 && (
                    <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-muted px-1 text-[10px] font-semibold text-muted-foreground">
                      {myState.totalElements}
                    </span>
                  )}
                </TabButton>
              )}
            </div>
          </div>

          {/* ── All Events ── */}
          {activeTab === "all" && (
            <div className="space-y-5">
              <FilterBar
                search={allState.search}
                onSearchChange={(v) =>
                  setAllState((s) => ({ ...s, search: v }))
                }
                activeCategory={allState.category}
                onCategoryChange={(c) =>
                  setAllState((s) => ({ ...s, category: c }))
                }
                showFilters={allState.showFilters}
                onToggleFilters={() =>
                  setAllState((s) => ({ ...s, showFilters: !s.showFilters }))
                }
              />
              <EventsGrid
                events={allState.events}
                totalElements={allState.totalElements}
                totalPages={allState.totalPages}
                currentPage={allState.page}
                isLoading={allState.loading}
                onLoadMore={loadMoreAll}
                onCardClick={openDialog}
                emptyMessage={
                  allState.search || allState.category
                    ? "No events match your filters."
                    : "No events yet."
                }
              />
            </div>
          )}

          {/* ── My Events ── */}
          {activeTab === "mine" && isAuthenticated && (
            <div className="space-y-5">
              <FilterBar
                search={myState.search}
                onSearchChange={(v) => setMyState((s) => ({ ...s, search: v }))}
                activeCategory={myState.category}
                onCategoryChange={(c) =>
                  setMyState((s) => ({ ...s, category: c }))
                }
                showFilters={myState.showFilters}
                onToggleFilters={() =>
                  setMyState((s) => ({ ...s, showFilters: !s.showFilters }))
                }
              />
              <EventsGrid
                events={myState.events}
                totalElements={myState.totalElements}
                totalPages={myState.totalPages}
                currentPage={myState.page}
                isLoading={myState.loading}
                onLoadMore={loadMoreMine}
                onCardClick={openDialog}
                emptyMessage="You haven't created any events yet."
                emptyAction={
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => router.push("/events/new")}
                  >
                    <Plus size={14} />
                    Create your first event
                  </Button>
                }
              />
            </div>
          )}
        </div>

        <div className="h-16" aria-hidden="true" />
      </div>

      {/* ── Event detail dialog (rendered outside page flow) ── */}
      <EventDialog
        event={dialogEvent}
        currentUserId={currentUserId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
