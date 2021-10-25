import { ErrorHandler, ModuleWithProviders, NgModule } from '@angular/core';
import { Router } from '@angular/router';
import { createErrorHandler, ErrorHandlerOptions, TraceService } from '@sentry/angular';

@NgModule()
export class NgxSentryModule {
    constructor(
        // Force instantiating Tracing
        public traceService: TraceService
    ) { }

    public static forRoot(errorHandlerOptions?: ErrorHandlerOptions): ModuleWithProviders<NgxSentryModule> {
        return {
            ngModule: NgxSentryModule,
            providers: [
                {
                    // Automatically send Javascript errors captured by the Angular's error handler
                    provide: ErrorHandler,
                    useValue: createErrorHandler({
                        // --- default options ---
                        showDialog: false,
                        // --- custom options ---
                        ...errorHandlerOptions
                    })
                },
                {
                    // Register SentryTrace as a provider in Angular's DI system
                    provide: TraceService,
                    deps: [Router]
                }
            ]
        };
    }
}
