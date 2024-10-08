import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { ErrorHandlerOptions } from '@sentry/angular';

import { NGX_SENTRY_PROVIDERS } from './ngx-sentry';

export const provideSentry = (options?: ErrorHandlerOptions): EnvironmentProviders =>
    makeEnvironmentProviders(NGX_SENTRY_PROVIDERS(options));
