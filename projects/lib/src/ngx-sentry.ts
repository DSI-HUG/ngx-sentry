/* eslint-disable @typescript-eslint/naming-convention */
import { APP_INITIALIZER, ErrorHandler, Provider } from '@angular/core';
import { Router } from '@angular/router';
import {
    BrowserOptions, configureScope, createErrorHandler, ErrorHandlerOptions, init, instrumentAngularRouting,
    TraceService, User
} from '@sentry/angular-ivy';
import { Integrations } from '@sentry/tracing';

export const NGX_SENTRY_PROVIDERS = (options?: ErrorHandlerOptions): Provider[] => [{
    // Automatically send Javascript errors captured by the Angular's error handler
    provide: ErrorHandler,
    multi: true,
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
    tracingOrigins?: (string | RegExp)[];
};

export const setSentryUser = (user: User | null): void => {
    configureScope(scope => scope.setUser(user));
};

export const initSentry = (options: SentryOptions): void => {
    const defaultOptions = {
        autoSessionTracking: true,
        integrations: [
            // Registers and configures the Tracing integration, which automatically instruments the application
            // to monitor its performance, including custom Angular routing instrumentation.
            new Integrations.BrowserTracing({
                tracingOrigins: options.tracingOrigins ?? ['localhost', /^\//],
                routingInstrumentation: instrumentAngularRouting
            })
        ],
        // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
        // We recommend adjusting this value in production.
        tracesSampleRate: 0.2
    };

    // Initialize Sentry
    init({
        ...defaultOptions,
        ...options
    });
};
