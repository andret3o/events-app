"use server";

import { cookies } from "next/headers";

export async function backendFetch(path: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  try {
    const response = await fetch(`${process.env.BACKEND_URL}${path}`, {
      ...options,
      headers: {
        ...options.headers,
        Cookie: token ? `access_token=${token}` : "",
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (err) {
    return Response.json({
      sucess: false,
      message: err instanceof Error ? err.message : "Unexpected error",
    });
  }
}
