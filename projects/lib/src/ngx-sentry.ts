/* eslint-disable @typescript-eslint/naming-convention */
import { APP_INITIALIZER, ErrorHandler, Provider } from '@angular/core';
import { Router } from '@angular/router';
import {
    BrowserOptions, browserTracingIntegration, createErrorHandler, ErrorHandlerOptions, getCurrentScope, init, TraceService, User
} from '@sentry/angular-ivy';

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
        integrations: [browserTracingIntegration()],
        tracePropagationTargets: options.tracePropagationTargets ?? ['localhost', /^\//],
        tracesSampleRate: 0.2
    };

    // Initialize Sentry
    init({
        ...defaultOptions,
        ...options
    });
};
