import { EventResponse } from "@/types/event";
import { CalendarDays, ChevronDown, Loader2 } from "lucide-react";
import { EventCard } from "./event-card";
import { Card, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";

export function EventsGrid({
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
  console.log(events);

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
