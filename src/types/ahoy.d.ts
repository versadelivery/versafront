declare module "ahoy.js" {
  interface AhoyConfig {
    urlPrefix?: string;
    visitsUrl?: string;
    eventsUrl?: string;
    page?: string;
    platform?: string;
    useBeacon?: boolean;
    startOnReady?: boolean;
    trackVisits?: boolean;
    cookies?: boolean;
    cookieDomain?: string;
    headers?: Record<string, string>;
    visitParams?: Record<string, unknown>;
    withCredentials?: boolean;
  }

  interface Ahoy {
    configure(options: AhoyConfig): void;
    track(name: string, properties?: Record<string, unknown>): void;
    trackView(additionalProperties?: Record<string, unknown>): void;
    trackClicks(selector: string): void;
    trackSubmits(selector: string): void;
    trackChanges(selector: string): void;
    start(): void;
    reset(): void;
  }

  const ahoy: Ahoy;
  export default ahoy;
}
