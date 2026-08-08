import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getKiteLoginURL } from "@/lib/kite";

// Sends the user to their own Kite Connect app's real login page. Used both for
// first-time connections (right after /api/kite-onboard/connect provisions the
// app) and daily session refreshes — either way, the password/TOTP are entered
// directly on kite.zerodha.com and never reach this server.
export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: tokenRow } = await supabase
    .from("user_kite_tokens")
    .select("api_key")
    .eq("user_id", user.id)
    .single();

  if (!tokenRow?.api_key) {
    return NextResponse.redirect(`${origin}/dashboard?error=kite_not_onboarded`);
  }

  return NextResponse.redirect(getKiteLoginURL(tokenRow.api_key));
}
