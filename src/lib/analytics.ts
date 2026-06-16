export type AnalyticsEvent =
  | "question_impression"
  | "question_selected"
  | "demo_started"
  | "demo_completed"
  | "hero_cta_clicked";

export interface TrackProperties {
  question_id?: string;
  question_text?: string;
  question_category?: string;
  questions_shown?: string[];
  button?: string;
  [key: string]: unknown;
}

type PostHog = { capture?: (event: string, props?: unknown) => void };

export function track(event: AnalyticsEvent, props?: TrackProperties): void {
  if (typeof window === "undefined") return;
  const ph = (window as unknown as Record<string, unknown>).posthog as PostHog | undefined;
  ph?.capture?.(event, props);
  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics] ${event}`, props);
  }
}
