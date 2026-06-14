/**
 * Mock analytics service for UrgentCart.
 * Logs events to console and stores them in-memory for demo purposes.
 */

interface AnalyticsEvent {
  name: string;
  data: Record<string, unknown>;
  timestamp: string;
}

const events: AnalyticsEvent[] = [];

/**
 * Track an analytics event.
 * In production, this would send to a real analytics service.
 */
export function trackEvent(name: string, data: Record<string, unknown> = {}): void {
  const event: AnalyticsEvent = {
    name,
    data,
    timestamp: new Date().toISOString(),
  };

  events.push(event);
  console.log(`[Analytics] ${name}`, data);
}

/**
 * Get all tracked events (useful for demo/debugging).
 */
export function getEvents(): AnalyticsEvent[] {
  return [...events];
}
