import { createHash } from "crypto";

const BASE_URL = "https://api.kite.trade";
const KITE_VERSION = "3";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function getKiteLoginURL(): string {
  const apiKey = process.env.KITE_API_KEY!;
  return `https://kite.zerodha.com/connect/login?v=${KITE_VERSION}&api_key=${apiKey}`;
}

export async function exchangeToken(requestToken: string): Promise<{
  access_token: string;
  kite_user_id: string;
  kite_user_name: string;
}> {
  const apiKey = process.env.KITE_API_KEY!;
  const apiSecret = process.env.KITE_API_SECRET!;

  const checksum = createHash("sha256")
    .update(apiKey + requestToken + apiSecret)
    .digest("hex");

  const res = await fetch(`${BASE_URL}/session/token`, {
    method: "POST",
    headers: {
      "X-Kite-Version": KITE_VERSION,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ api_key: apiKey, request_token: requestToken, checksum }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? `Kite token exchange failed: ${res.status}`);
  }

  const data = (await res.json()) as {
    data: { access_token: string; user_id: string; user_name: string };
  };

  return {
    access_token: data.data.access_token,
    kite_user_id: data.data.user_id,
    kite_user_name: data.data.user_name,
  };
}

// ─── Kite API helper ──────────────────────────────────────────────────────────

async function kiteGet<T>(path: string, accessToken: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "X-Kite-Version": KITE_VERSION,
      Authorization: `token ${process.env.KITE_API_KEY!}:${accessToken}`,
    },
    next: { revalidate: 0 }, // always fresh — trading data must not be stale
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? `Kite API error on ${path}: ${res.status}`);
  }

  const json = (await res.json()) as { data: T };
  return json.data;
}

// ─── Data types ───────────────────────────────────────────────────────────────

export interface KiteProfile {
  user_id: string;
  user_name: string;
  email: string;
  user_type: string;
  broker: string;
  exchanges: string[];
  products: string[];
  order_types: string[];
}

export interface KiteMargins {
  equity: {
    enabled: boolean;
    net: number;
    available: { live_balance: number; collateral: number; intraday_payin: number };
    utilised: { debits: number; exposure: number; m2m_unrealised: number; m2m_realised: number; option_premium: number; payout: number; span: number; holding_sales: number; turnover: number };
  };
  commodity: {
    enabled: boolean;
    net: number;
    available: { live_balance: number; collateral: number; intraday_payin: number };
    utilised: { debits: number; exposure: number; m2m_unrealised: number; m2m_realised: number; option_premium: number; payout: number; span: number; holding_sales: number; turnover: number };
  };
}

export interface KitePosition {
  tradingsymbol: string;
  exchange: string;
  instrument_token: number;
  product: string;
  quantity: number;
  average_price: number;
  last_price: number;
  pnl: number;
  m2m: number;
  unrealised: number;
  realised: number;
  buy_quantity: number;
  sell_quantity: number;
  buy_price: number;
  sell_price: number;
  multiplier: number;
  overnight_quantity: number;
  day_buy_quantity: number;
  day_sell_quantity: number;
}

export interface KiteHolding {
  tradingsymbol: string;
  exchange: string;
  instrument_token: number;
  isin: string;
  product: string;
  quantity: number;
  authorised_quantity: number;
  average_price: number;
  last_price: number;
  close_price: number;
  pnl: number;
  day_change: number;
  day_change_percentage: number;
  collateral_quantity: number;
  collateral_type: string;
  discrepancy: boolean;
  t1_quantity: number;
}

export interface KiteOrder {
  order_id: string;
  exchange_order_id: string | null;
  parent_order_id: string | null;
  status: string;
  status_message: string | null;
  tradingsymbol: string;
  exchange: string;
  instrument_token: number;
  transaction_type: string;
  order_type: string;
  product: string;
  quantity: number;
  filled_quantity: number;
  pending_quantity: number;
  cancelled_quantity: number;
  average_price: number;
  price: number;
  trigger_price: number;
  variety: string;
  order_timestamp: string;
  exchange_timestamp: string | null;
  tag: string | null;
}

export interface KiteTrade {
  trade_id: string;
  order_id: string;
  exchange_order_id: string;
  tradingsymbol: string;
  exchange: string;
  instrument_token: number;
  transaction_type: string;
  product: string;
  quantity: number;
  average_price: number;
  fill_timestamp: string;
  order_timestamp: string;
  exchange_timestamp: string;
}

export interface KitePortfolioData {
  profile: KiteProfile;
  margins: KiteMargins;
  positions: { net: KitePosition[]; day: KitePosition[] };
  holdings: KiteHolding[];
  orders: KiteOrder[];
  trades: KiteTrade[];
}

// ─── Fetch all trading data in parallel ───────────────────────────────────────

export async function fetchPortfolioData(accessToken: string): Promise<KitePortfolioData> {
  const [profile, margins, positionsRaw, holdings, orders, trades] = await Promise.all([
    kiteGet<KiteProfile>("/user/profile", accessToken),
    kiteGet<KiteMargins>("/user/margins", accessToken),
    kiteGet<{ net: KitePosition[]; day: KitePosition[] }>("/portfolio/positions", accessToken),
    kiteGet<KiteHolding[]>("/portfolio/holdings", accessToken),
    kiteGet<KiteOrder[]>("/orders", accessToken),
    kiteGet<KiteTrade[]>("/trades", accessToken),
  ]);

  return { profile, margins, positions: positionsRaw, holdings, orders, trades };
}
