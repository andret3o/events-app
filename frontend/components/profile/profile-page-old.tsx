"use client";

import { useEffect, useState } from "react";
import { PageableResponse } from "@/types/types";
import { UserResponse } from "@/types/user";
import { getEventsByOwner } from "@/lib/api/event";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Field, FieldGroup } from "../ui/field";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { EventResponse } from "@/types/event";

export default function ProfilePage({ user }: { user: UserResponse }) {
  const [myEvents, setMyEvents] =
    useState<PageableResponse<EventResponse> | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      const res = await getEventsByOwner(user.id, undefined, 4);
      if (res.success && res.data) {
        setMyEvents(res.data);
      }
    }
    fetchEvents();
  }, []);

  return (
    <div className="min-h-dvh min-w-dvh text-white p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      {/* Page Title  */}
      <div className="text-center space-y-1 mt-4">
        <h1 className="text-3xl md:text-4xl font-light tracking-tight">
          Your Profile
        </h1>
        <p className="text-white/40 text-xs font-light">
          Manage your account and events
        </p>
      </div>

      {/* Header Section (User Info) */}
      <section className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 backdrop-blur-2xl flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xl font-light">
          {user.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-light">{user.name}</h1>
          <p className="text-white/40 text-sm">{user.email}</p>
        </div>
      </section>

      {/* Events Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg uppercase tracking-[0.2em] text-white/60 font-mono ml-2">
            My Events
          </h2>
          {/* <button className="h-10 px-6 rounded-full bg-white text-neutral-900 text-xs font-bold hover:scale-[1.02] transition-transform">
            + Add Event
          </button> */}
          <Dialog>
            <form>
              <DialogTrigger asChild>
                {/* <Button variant="outline">Open Dialog</Button> */}
                <button className="h-10 px-6 rounded-full bg-white text-neutral-900 text-xs font-bold hover:scale-[1.02] transition-transform">
                  + Add Event
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>Add Event</DialogTitle>
                  <DialogDescription></DialogDescription>
                </DialogHeader>
                <FieldGroup>
                  <Field>
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" />
                  </Field>
                  <Field>
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" name="description" />
                  </Field>
                </FieldGroup>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit">Publish</Button>
                </DialogFooter>
              </DialogContent>
            </form>
          </Dialog>
        </div>

        {!myEvents || myEvents.empty ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-40 border border-dashed border-white/10 rounded-[32px] flex items-center justify-center text-white/20 col-span-1 md:col-span-2">
              <p className="text-sm">No events published yet</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myEvents.content.map((event) => {
                // Format the date
                const formattedDate = new Date(
                  event.startTime,
                ).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: false,
                });

                return (
                  <div
                    key={event.id}
                    className="bg-white/[0.03] border border-white/10 rounded-[24px] p-6 hover:bg-white/[0.06] transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="font-medium truncate">{event.title}</h3>
                      <p className="text-xs text-white/40 mt-1">
                        {event.category}
                      </p>
                    </div>

                    {/* Date and Time Section */}
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <p className="text-xs text-white/60 font-mono">
                        {formattedDate}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {!myEvents.last && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => console.log("Fetch next page...")}
                  className="px-6 py-2 rounded-full border border-white/10 bg-white/[0.03] text-xs font-medium hover:bg-white/10 transition-colors"
                >
                  Show All
                </button>
              </div>
            )}
          </div>
        )}
      </section>
      <div className="h-20" aria-hidden="true" />
    </div>
  );
}
