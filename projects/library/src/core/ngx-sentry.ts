import { BrowserOptions, init, instrumentAngularRouting } from '@sentry/angular';
import { Integrations } from '@sentry/tracing';

export interface NgxBrowserOptions extends BrowserOptions {
    dsn: string;
    environment: string;
    release: string;
    tracingOrigins?: Array<string | RegExp>;
}

export const initSentry = (browserOptions: NgxBrowserOptions): void => {
    init({
        // --- default options ---
        autoSessionTracking: true,
        integrations: [
            // Registers and configures the Tracing integration, which automatically instruments the application
            // to monitor its performance, including custom Angular routing instrumentation.
            new Integrations.BrowserTracing({
                tracingOrigins: browserOptions.tracingOrigins || ['localhost', /^\//],
                routingInstrumentation: instrumentAngularRouting
            })
        ],
        // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
        // We recommend adjusting this value in production.
        tracesSampleRate: 0.2,

        // --- custom options ---
        ...browserOptions
    });
};
