export interface Question {
  id: string;
  text: string;
  weight: number;
  category: "pnl" | "options" | "risk" | "institutional" | "portfolio" | "journal";
  impressions: number;
  clicks: number;
}

export const questionPool: Question[] = [
  { id: "q_001", text: "My M2M, 6 months running Net PnL and Transaction Costs", weight: 1, category: "pnl", impressions: 0, clicks: 0 },
  { id: "q_002", text: "What is my delta, theta and vega across all positions and suggest neutral-delta option trades", weight: 1, category: "options", impressions: 0, clicks: 0 },
  { id: "q_003", text: "Top 10 stocks with highest Implied Volatility vs Realised Volatility", weight: 1, category: "options", impressions: 0, clicks: 0 },
  { id: "q_004", text: "Which stocks saw the highest MWPL spike yesterday and how much did they move", weight: 1, category: "risk", impressions: 0, clicks: 0 },
  { id: "q_005", text: "Last 60 days Nifty movement with FII and DII inflows", weight: 1, category: "institutional", impressions: 0, clicks: 0 },
  { id: "q_006", text: "Show Long Short Ratio changes with sector rotation", weight: 1, category: "institutional", impressions: 0, clicks: 0 },
  { id: "q_007", text: "Which positions are consuming the most margin today", weight: 1, category: "risk", impressions: 0, clicks: 0 },
  { id: "q_008", text: "Find unusual option activity before market close", weight: 1, category: "options", impressions: 0, clicks: 0 },
  { id: "q_009", text: "What sectors are attracting the most institutional money", weight: 1, category: "institutional", impressions: 0, clicks: 0 },
  { id: "q_010", text: "Build a portfolio similar to Smallcase focused on defence stocks", weight: 1, category: "portfolio", impressions: 0, clicks: 0 },
  { id: "q_011", text: "Suggest option strategies with negative theta exposure", weight: 1, category: "options", impressions: 0, clicks: 0 },
  { id: "q_012", text: "Show all positions with highest overnight risk", weight: 1, category: "risk", impressions: 0, clicks: 0 },
  { id: "q_013", text: "Compare my transaction costs across brokers", weight: 1, category: "pnl", impressions: 0, clicks: 0 },
  { id: "q_014", text: "Show trade journal insights from my last 100 trades", weight: 1, category: "journal", impressions: 0, clicks: 0 },
  { id: "q_015", text: "Generate a swing trading watchlist using momentum and volume", weight: 1, category: "portfolio", impressions: 0, clicks: 0 },
];

function fisherYates<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getRandomQuestions(count = 3, excludeIds: string[] = []): Question[] {
  let pool = questionPool.filter((q) => !excludeIds.includes(q.id));
  // If not enough left after exclusion, reset and use full pool
  if (pool.length < count) pool = [...questionPool];
  return fisherYates(pool).slice(0, count);
}
