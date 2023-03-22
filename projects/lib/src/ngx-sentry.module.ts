import { ModuleWithProviders, NgModule } from '@angular/core';
import { ErrorHandlerOptions } from '@sentry/angular-ivy';

import { NGX_SENTRY_PROVIDERS } from './ngx-sentry';

@NgModule()
export class NgxSentryModule {
    public static forRoot(options?: ErrorHandlerOptions): ModuleWithProviders<NgxSentryModule> {
        return {
            ngModule: NgxSentryModule,
            providers: NGX_SENTRY_PROVIDERS(options)
        };
    }
}
