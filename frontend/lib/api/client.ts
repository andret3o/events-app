"use server";

import { cookies } from "next/headers";

export async function backendFetch(path: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  const isFormData = options.body instanceof FormData;

  const headers = new Headers(options.headers);

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Cookie", `access_token=${token}`);
  }

  try {
    const response = await fetch(`${process.env.BACKEND_URL}${path}`, {
      ...options,
      headers,
    });
    return response;
  } catch (err) {
    return Response.json({
      success: false,
      message: err instanceof Error ? err.message : "Unexpected error",
    });
  }
}
