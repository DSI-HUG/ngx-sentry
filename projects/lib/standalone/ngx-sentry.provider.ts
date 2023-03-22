import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { NGX_SENTRY_PROVIDERS } from '@hug/ngx-sentry';
import { ErrorHandlerOptions } from '@sentry/angular-ivy';

export const provideSentry = (options?: ErrorHandlerOptions): EnvironmentProviders =>
    makeEnvironmentProviders(NGX_SENTRY_PROVIDERS(options));
