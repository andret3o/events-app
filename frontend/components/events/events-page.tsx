"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  getPagedEvents,
  getEventsByOwner,
  getEventsByCategory,
} from "@/lib/api/event";
import { EventCategory, EventResponse } from "@/types/event";
import { PageableResponse } from "@/types/types";
import { EventDialog } from "@/components/events/event-dialog";
import { FilterBar } from "./filter-bar";
import { EventsGrid } from "./events-grid";

// ─── Props ────────────────────────────────────────────────────────────────────

interface EventsPageProps {
  initialEvents: PageableResponse<EventResponse>;
  initialMyEvents: PageableResponse<EventResponse> | null;
  currentUserId: number | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 12;

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
        setAllState((s) => ({
          ...s,
          events: searched,
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
