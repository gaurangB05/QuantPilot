import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as
    | { apiKey?: string; apiSecret?: string }
    | null;
  const apiKey = body?.apiKey?.trim();
  const apiSecret = body?.apiSecret?.trim();

  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: "API key and secret are both required." }, { status: 400 });
  }

  // access_token/kite_user_id/kite_user_name get filled in by the callback
  // once the user completes the real Kite login redirect right after this.
  const { error } = await supabase.from("user_kite_tokens").upsert(
    {
      user_id: user.id,
      api_key: apiKey,
      api_secret: apiSecret,
      access_token: "",
      kite_user_id: "",
      kite_user_name: "",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
