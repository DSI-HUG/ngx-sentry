import { BrowserOptions, ErrorHandlerOptions } from '@sentry/angular';

export interface SentryConfig extends BrowserOptions {
    tracingOrigins: string[];
    errorHandlerOptions: ErrorHandlerOptions
}
