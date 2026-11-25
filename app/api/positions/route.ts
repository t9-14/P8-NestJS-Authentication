import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function userClient(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return { error: NextResponse.json({ error: "Authentication required." }, { status: 401 }) };
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return { error: NextResponse.json({ error: "Supabase is not configured." }, { status: 500 }) };
  const client = createClient(url, key, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false, autoRefreshToken: false } });
  return { client };
}

function databaseError(error: { message: string; code?: string }) {
  if (error.code === "PGRST205" || error.message.includes("schema cache")) {
    return NextResponse.json({ error: "The positions table is not available yet. Run supabase-positions.sql in the Supabase SQL Editor, then reload the schema cache (or wait briefly for it to refresh)." }, { status: 503 });
  }
  return NextResponse.json({ error: error.message }, { status: 400 });
}

export async function GET(request: NextRequest) {
  const auth = userClient(request);
  if (auth.error) return auth.error;
  const { data: { user }, error: authError } = await auth.client.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Your session is invalid or expired." }, { status: 401 });
  const { data, error } = await auth.client.from("positions").select("id, position_code, position_name, created_at, updated_at").order("id", { ascending: true });
  if (error) return databaseError(error);
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const auth = userClient(request);
  if (auth.error) return auth.error;
  const { data: { user }, error: authError } = await auth.client.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Your session is invalid or expired." }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 }); }
  const position_code = typeof body.position_code === "string" ? body.position_code.trim() : "";
  const position_name = typeof body.position_name === "string" ? body.position_name.trim() : "";
  if (!position_code || !position_name) return NextResponse.json({ error: "Position code and position name are required." }, { status: 400 });
  const { data, error } = await auth.client.from("positions").insert({ position_code, position_name, user_id: user.id }).select("id, position_code, position_name, created_at, updated_at").single();
  if (error) return error.code === "23505" ? NextResponse.json({ error: "That position code is already in use." }, { status: 409 }) : databaseError(error);
  return NextResponse.json(data, { status: 201 });
}
