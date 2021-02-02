export interface SentryConfig {
    dsn: string;
    environment?: string,
    release?: string,
    tracingOrigins: string[]
}