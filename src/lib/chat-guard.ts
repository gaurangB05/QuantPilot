// Deterministic guard against personalized buy/sell advice requests.
// Giving specific trade recommendations without SEBI RIA registration is a
// regulatory risk in India — this must not depend on the LLM choosing to
// decline, so it's checked before any AI call is made.

const ADVICE_PATTERNS: RegExp[] = [
  /\bshould i (buy|sell|hold|exit|enter)\b/i,
  /\bwhich (stocks?|shares?) (should|to) (i |we )?(buy|sell|pick|choose)\b/i,
  /\bwhat (should i|to) buy\b/i,
  /\brecommend (a|any|me a?)? ?stocks?\b/i,
  /\bis (it|this|now) (a )?good time to (buy|sell|invest)\b/i,
  /\bkya (mujhe|main|hume) .*(bechna|khareedna|becha|kharida|bechu|kharidu)/i,
  /\bkaunsi stock (khareed|becha|kharidu|bechu|le)/i,
  /\b(buy|becho?|khareed\w*) (karu|karo|kru) ya (sell|becho?|khareed\w*)/i,
  /\bstock tip/i,
];

export function isInvestmentAdviceRequest(message: string): boolean {
  return ADVICE_PATTERNS.some((re) => re.test(message));
}

export const ADVICE_DISCLAIMER =
  "I can't give personalized buy/sell recommendations — I'm not a SEBI-registered investment advisor. " +
  "I can help you understand what's already in your portfolio instead — P&L, concentration, holding period, margin usage — so you can make your own call.";
