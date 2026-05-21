"use server";

import { UserLoginRequest, UserRegistrationRequest } from "@/types/user";
import { backendFetch } from "./client";
import { ApiResponse } from "@/types/types";

export async function login(req: UserLoginRequest) {
  const res = await backendFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(req),
  });

  const body: ApiResponse<void> = await res.json();
  return body;
}

export async function register(req: UserRegistrationRequest) {
  const res = await backendFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(req),
  });

  const body: ApiResponse<void> = await res.json();
  return body;
}

export async function logout() {
  const res = await backendFetch("/auth/logout", {
    method: "POST",
  });

  const body: ApiResponse<void> = await res.json();
  return body;
}
