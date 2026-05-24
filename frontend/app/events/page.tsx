import { Suspense } from "react";
import EventsPage from "@/components/events-page";
import { getPagedEvents, getEventsByOwner } from "@/lib/api/event";
import { getMe } from "@/lib/api/user";

// Loading fallback (shown instantly while the Suspense boundary resolves)
function EventsPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-2">
          <div className="h-8 w-32 rounded-lg bg-muted animate-pulse" />
          <div className="h-4 w-56 rounded bg-muted animate-pulse" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-5 space-y-3"
            >
              <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
              <div className="h-3 w-full rounded bg-muted animate-pulse" />
              <div className="h-3 w-5/6 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Inner async server component — does the actual data fetching
async function EventsPageInner() {
  // Fetch current user first — failure means unauthenticated
  const userRes = await getMe();
  const isAuthenticated = userRes.success && !!userRes.data;
  const currentUser = isAuthenticated ? userRes.data! : null;

  // Always fetch the all-events page
  const allEventsRes = await getPagedEvents(0, 12);
  const initialEvents =
    allEventsRes.success && allEventsRes.data
      ? allEventsRes.data
      : {
          content: [],
          totalElements: 0,
          totalPages: 0,
          number: 0,
          numberOfElements: 0,
          size: 12,
          empty: true,
          first: true,
          last: true,
          pageable: {
            offset: 0,
            pageNumber: 0,
            pageSize: 12,
            paged: true,
            unpaged: false,
            sort: { empty: true, sorted: false, unsorted: true },
          },
          sort: { empty: true, sorted: false, unsorted: true },
        };

  // Only fetch user events if authenticated
  let initialMyEvents = null;
  if (isAuthenticated && currentUser) {
    const myEventsRes = await getEventsByOwner(currentUser.id, 0, 12);
    if (myEventsRes.success && myEventsRes.data) {
      initialMyEvents = myEventsRes.data;
    }
  }

  return (
    <EventsPage
      initialEvents={initialEvents}
      initialMyEvents={initialMyEvents}
      currentUserId={currentUser?.id ?? null}
    />
  );
}

// Route export — wraps inner component in Suspense (required for useSearchParams)
export default function Page() {
  return (
    <Suspense fallback={<EventsPageSkeleton />}>
      <EventsPageInner />
    </Suspense>
  );
}
