"use server";

import { UserLoginRequest, UserRegistrationRequest } from "@/types/user";
import { backendFetch } from "./client";
import { ApiResponse, AuthResponse } from "@/types/types";
import { cookies } from "next/headers";

export async function login(req: UserLoginRequest) {
  const res = await backendFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    const body: ApiResponse<void> = await res.json();
    return body;
  }

  const body: ApiResponse<AuthResponse> = await res.json();

  if (body.data) {
    const data = body.data;
    const cookieStore = await cookies();

    cookieStore.set("access_token", data.accessToken, {
      maxAge: data.expirationMs,
      httpOnly: true,
      secure: false,
    });

    return {
      message: "Successfully logged in",
      success: true,
      timestamp: body.timestamp,
    };
  }
  return {
    message: "Unexpected error",
    success: false,
    timestamp: body.timestamp,
  };
}

export async function register(req: UserRegistrationRequest) {
  const res = await backendFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    const body: ApiResponse<void> = await res.json();
    return body;
  }

  const body: ApiResponse<AuthResponse> = await res.json();

  if (body.success && body.data) {
    const data = body.data;
    const cookieStore = await cookies();

    cookieStore.set("access_token", data.accessToken, {
      maxAge: data.expirationMs,
      httpOnly: true,
      secure: false,
    });

    return {
      message: "Successfully registered",
      success: true,
      timestamp: body.timestamp,
    };
  }

  return {
    message: "Unexpected error",
    success: false,
    timestamp: body.timestamp,
  };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
}
