import { BrowserOptions } from '@sentry/angular';

export interface SentryConfig extends BrowserOptions {
    tracingOrigins: string[];
}
