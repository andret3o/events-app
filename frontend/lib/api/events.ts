"use server";

import {
  ApiResponse,
  EventCategory,
  EventResponse,
  PageableResponse,
} from "@/types/types";
import { backendFetch } from "./client";

export async function getAllEvents() {
  const res = await backendFetch("/events/all");
  const body: ApiResponse<EventResponse[]> = await res.json();
  return body;
}

export async function getPagedEvents() {
  const res = await backendFetch("/events");
  const body: ApiResponse<PageableResponse<EventResponse>> = await res.json();
  return body;
}

export async function getEventsByOwner(
  id: number,
  page?: number,
  size?: number,
) {
  const params = new URLSearchParams();
  if (page !== undefined) params.append("page", page.toString());
  if (size !== undefined) params.append("size", size.toString());

  const queryString = params.toString();
  const res = await backendFetch(
    `/events/owner/${id}${queryString ? "?" + queryString : ""}`,
  );
  const body: ApiResponse<PageableResponse<EventResponse>> = await res.json();
  return body;
}

export async function getEventsByCategory(category: EventCategory) {
  const res = await backendFetch("/events");
  const body: ApiResponse<PageableResponse<EventResponse>> = await res.json();
  return body;
}
