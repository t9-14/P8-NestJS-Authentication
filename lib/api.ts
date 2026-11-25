import { supabase } from "./supabase";
import { getAccessToken, logout } from "./auth";
import { CONFIG } from "./config";

export const api = supabase;

type ApiOptions = Omit<RequestInit, "body"> & {
  requiresAuth?: boolean;
  body?: unknown;
};

export async function apiClient<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { requiresAuth = true, headers, body, ...requestOptions } = options;
  const requestHeaders = new Headers(headers);
  if (body !== undefined) requestHeaders.set("Content-Type", "application/json");

  if (requiresAuth) {
    await getAccessToken();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token ?? null;
    if (!token) {
      await logout().catch(() => undefined);
      throw new Error("Your session has expired. Please log in again.");
    }
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
      ...requestOptions,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error("Unable to connect to the server. Please try again.");
  }

  const contentType = response.headers.get("content-type") ?? "";
  let payload: unknown;
  if (response.status !== 204) {
    const text = await response.text();
    if (text) {
      if (contentType.includes("application/json")) {
        try { payload = JSON.parse(text); } catch { payload = text; }
      } else payload = text;
    }
  }

  if (!response.ok) {
    if (response.status === 401 && requiresAuth) {
      await logout().catch(() => undefined);
    }
    const detail = typeof payload === "string"
      ? payload
      : payload && typeof payload === "object" && "error" in payload
        ? String(payload.error)
        : `Request failed with status ${response.status}.`;
    throw new Error(detail);
  }

  return payload as T;
}
