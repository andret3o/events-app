"use server";

import { ApiResponse, PageableResponse } from "@/types/types";
import { backendFetch } from "./client";
import { EventCategory, EventRequest, EventResponse } from "@/types/event";

export async function getAllEvents() {
  const res = await backendFetch("/events/all");
  const body: ApiResponse<EventResponse[]> = await res.json();
  return body;
}

export async function getPagedEvents(
  page?: number,
  size?: number,
  sort?: string,
) {
  const params = new URLSearchParams();
  if (page !== undefined) params.append("page", page.toString());
  if (size !== undefined) params.append("size", size.toString());
  if (sort !== undefined) params.append("sort", sort);

  const queryString = params.toString();
  const res = await backendFetch(
    `/events${queryString ? "?" + queryString : ""}`,
  );
  const body: ApiResponse<PageableResponse<EventResponse>> = await res.json();
  return body;
}

export async function createEvent(req: FormData) {
  const res = await backendFetch("/events", {
    method: "POST",
    body: req,
  });

  const body: ApiResponse<EventResponse> = await res.json();
  return body;
}

export async function getEventsByOwner(
  id: number,
  page?: number,
  size?: number,
  sort?: string,
) {
  const params = new URLSearchParams();
  if (page !== undefined) params.append("page", page.toString());
  if (size !== undefined) params.append("size", size.toString());
  if (sort !== undefined) params.append("sort", sort);

  const queryString = params.toString();
  const res = await backendFetch(
    `/events/owner/${id}${queryString ? "?" + queryString : ""}`,
  );
  const body: ApiResponse<PageableResponse<EventResponse>> = await res.json();
  return body;
}

export async function getEventsByCategory(category: EventCategory) {
  const res = await backendFetch(`/events/category/${category}`);
  const body: ApiResponse<PageableResponse<EventResponse>> = await res.json();
  return body;
}
