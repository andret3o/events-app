"use server";

import { ApiResponse } from "@/types/types";
import { backendFetch } from "./client";
import { UserResponse } from "@/types/user";

export async function getMe() {
  const res = await backendFetch("/user/me");
  const body: ApiResponse<UserResponse> = await res.json();
  return body;
}
