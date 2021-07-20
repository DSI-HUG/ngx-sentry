import { APP_INITIALIZER, ErrorHandler, ModuleWithProviders, NgModule } from '@angular/core';
import { Router } from '@angular/router';
import { createErrorHandler, TraceService } from '@sentry/angular';

import { SentryConfig } from './models/sentry-config.model';
import { NgxSentryService } from './services/ngx-sentry.service';

/* eslint-disable */
export function initializeSentry(sentryService: NgxSentryService): () => Promise<void> {
    return (): Promise<void> => sentryService.init();
}
export function initializeTracing(): () => Promise<void> {
    return (): Promise<void> => Promise.resolve();
}
/* eslint-enable */

@NgModule()
export class NgxSentryModule {
    public static forRoot(config: SentryConfig): ModuleWithProviders<NgxSentryModule> {
        return {
            ngModule: NgxSentryModule,
            providers: [
                {
                    provide: ErrorHandler,
                    useValue: createErrorHandler({
                        // Defaults options
                        showDialog: true,
                        // User options
                        ...config?.errorHandlerOptions
                    })
                },
                {
                    provide: TraceService,
                    deps: [Router]
                },
                {
                    provide: APP_INITIALIZER,
                    useFactory: initializeTracing,
                    deps: [TraceService],
                    multi: true
                },
                {
                    provide: 'sentryConfig',
                    useValue: config
                },
                {
                    provide: APP_INITIALIZER,
                    useFactory: initializeSentry,
                    deps: [NgxSentryService],
                    multi: true
                },
                NgxSentryService
            ]
        };
    }
}
