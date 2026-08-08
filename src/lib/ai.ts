import type { KitePortfolioData } from "@/lib/kite";

export interface DashboardConfig {
  widgets: string[];
}

// ─── Prompt construction ──────────────────────────────────────────────────────

function buildPrompt(tradingData: KitePortfolioData, userPrompt: string): string {
  const portfolioValue = tradingData.holdings.reduce((sum, h) => sum + h.last_price * h.quantity, 0);
  const pnl =
    tradingData.holdings.reduce((sum, h) => sum + h.pnl, 0) +
    tradingData.positions.net.reduce((sum, p) => sum + p.pnl, 0);

  return `You are a dashboard personalization engine for a trading platform.

Given the authenticated user's own trading data below, decide which dashboard widgets should be shown to them and in what order. Base your decision only on what is actually present or relevant in their data and on their prompt — do not use a fixed template.

Portfolio Value: ${portfolioValue}
Total P&L: ${pnl}
Margins: ${JSON.stringify(tradingData.margins)}
Holdings: ${JSON.stringify(tradingData.holdings)}
Positions: ${JSON.stringify(tradingData.positions)}
Orders: ${JSON.stringify(tradingData.orders)}
Trades: ${JSON.stringify(tradingData.trades)}

User prompt: "${userPrompt}"

Respond with ONLY a JSON object of this exact shape, no markdown, no commentary:
{"widgets": ["WidgetName", "WidgetName", ...]}`;
}

function parseWidgets(text: string): DashboardConfig {
  const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const parsed = JSON.parse(cleaned);

  if (!Array.isArray(parsed.widgets) || !parsed.widgets.every((w: unknown) => typeof w === "string")) {
    throw new Error("AI response did not contain a valid widgets array");
  }

  return { widgets: parsed.widgets };
}

// ─── Vendor calls ──────────────────────────────────────────────────────────────

async function callAnthropic(prompt: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || "claude-sonnet-5",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`Anthropic API error: ${res.status}`);
  const data = await res.json();
  return data.content[0].text;
}

async function callOpenAI(prompt: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

async function callGemini(prompt: string): Promise<string> {
  const model = process.env.AI_MODEL || "gemini-2.0-flash";
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );

  if (res.status === 429) throw new Error("RATE_LIMITED");
  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

// ─── Entry point ───────────────────────────────────────────────────────────────

export async function generateDashboardConfig(
  tradingData: KitePortfolioData,
  userPrompt: string
): Promise<DashboardConfig> {
  const prompt = buildPrompt(tradingData, userPrompt);

  switch (process.env.AI_PROVIDER) {
    case "openai":
      return parseWidgets(await callOpenAI(prompt));
    case "gemini":
      return parseWidgets(await callGemini(prompt));
    case "anthropic":
    default:
      return parseWidgets(await callAnthropic(prompt));
  }
}

// ─── Portfolio chat ─────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function buildChatPrompt(tradingData: KitePortfolioData, history: ChatMessage[], message: string): string {
  const portfolioValue = tradingData.holdings.reduce((sum, h) => sum + h.last_price * h.quantity, 0);
  const pnl =
    tradingData.holdings.reduce((sum, h) => sum + h.pnl, 0) +
    tradingData.positions.net.reduce((sum, p) => sum + p.pnl, 0);

  const historyText = history
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");

  return `You are a portfolio assistant embedded in a trading dashboard. You can only discuss:
- The authenticated user's own trading data (given below)
- General trading/market education (explaining concepts, terms, how things work)

Hard rules:
- Never give a specific buy/sell/hold recommendation on any stock, or personalized investment advice. You are not a registered investment advisor.
- If the user's message is asking for that kind of advice, politely decline in one sentence and offer to analyze their existing data instead — do not answer the underlying question.
- Keep replies short (2-4 sentences) unless the user explicitly asks for more detail.
- Base analysis only on the data below — never invent figures.

Portfolio Value: ${portfolioValue}
Total P&L: ${pnl}
Margins: ${JSON.stringify(tradingData.margins)}
Holdings: ${JSON.stringify(tradingData.holdings)}
Positions: ${JSON.stringify(tradingData.positions)}
Orders: ${JSON.stringify(tradingData.orders)}
Trades: ${JSON.stringify(tradingData.trades)}

Conversation so far:
${historyText || "(none)"}

User: ${message}

Respond with plain text only — no markdown, no JSON.`;
}

export async function generateChatReply(
  tradingData: KitePortfolioData,
  history: ChatMessage[],
  message: string
): Promise<string> {
  const prompt = buildChatPrompt(tradingData, history, message);

  switch (process.env.AI_PROVIDER) {
    case "openai":
      return callOpenAI(prompt);
    case "gemini":
      return callGemini(prompt);
    case "anthropic":
    default:
      return callAnthropic(prompt);
  }
}
