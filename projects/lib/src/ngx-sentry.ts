/* eslint-disable @typescript-eslint/naming-convention */
import { APP_INITIALIZER, ErrorHandler, Provider } from '@angular/core';
import { Router } from '@angular/router';
import {
    BrowserOptions, browserTracingIntegration, createErrorHandler, ErrorHandlerOptions, getCurrentScope,
    init, replayIntegration, TraceService, User
} from '@sentry/angular';

export const NGX_SENTRY_PROVIDERS = (options?: ErrorHandlerOptions): Provider[] => [{
    // Automatically send Javascript errors captured by the Angular's error handler
    provide: ErrorHandler,
    useValue: createErrorHandler({
        showDialog: false,
        ...options
    })
}, {
    // Register SentryTrace as a provider in Angular's DI system
    provide: TraceService,
    deps: [Router]
}, {
    // Force instantiating Tracing
    provide: APP_INITIALIZER,
    useFactory: () => () => { /**/ },
    deps: [TraceService],
    multi: true
}];

export type SentryOptions = BrowserOptions & Required<Pick<BrowserOptions, 'dsn' | 'environment' | 'release'>> & {
    tracePropagationTargets?: (string | RegExp)[];
};

export const setSentryUser = (user: User | null): void => {
    getCurrentScope().setUser(user);
};

export const initSentry = (options: SentryOptions): void => {
    const defaultOptions = {
        autoSessionTracking: true,
        integrations: [
            // Registers and configures the Tracing integration, which automatically instruments your
            // application to monitor its performance, including custom Angular routing instrumentation
            browserTracingIntegration(),

            // Registers the Replay integration, which automatically captures Session Replays
            replayIntegration()
        ],

        // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing.
        // We recommend adjusting this value in production
        tracesSampleRate: 0.2,

        // Set `tracePropagationTargets` to control for which URLs trace propagation should be enabled
        tracePropagationTargets: options.tracePropagationTargets ?? ['localhost', /^\//],

        // This sets the sample rate to be 10%. You may want this to be 100% while
        // in development and sample at a lower rate in production
        replaysSessionSampleRate: 0.1,

        // If the entire session is not sampled, use the below sample rate to sample
        // sessions when an error occurs.
        replaysOnErrorSampleRate: 1.0
    };

    // Initialize Sentry
    init({
        ...defaultOptions,
        ...options
    });
};
