import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getKiteLoginURL } from "@/lib/kite";

// Re-authenticates an already-onboarded user with their own Kite Connect app
// (daily session refresh). First-time connections go through the /api/kite-onboard
// automation flow instead, since that's what creates the per-user app.
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
