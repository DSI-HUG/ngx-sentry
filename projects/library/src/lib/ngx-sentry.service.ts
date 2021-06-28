import { Inject, Injectable } from '@angular/core';
import { configureScope, init as initSentry, routingInstrumentation, User } from '@sentry/angular';
import { Integrations } from '@sentry/tracing';

import { SentryConfig } from './models/sentry-config.model';

@Injectable()
export class NgxSentryService {
    constructor(
        @Inject('sentryConfig') private config: SentryConfig
    ) { }

    /**
     * Init sentry configuration.
     * This function is automatically called on module initialisation.
     */
    public init(): Promise<void> {
        if (!this.config?.dsn) {
            console.warn('No Sentry DSN found. Ignore it.');
        } else {
            initSentry({
                autoSessionTracking: true,
                integrations: [
                    new Integrations.BrowserTracing({
                        tracingOrigins: (this.config?.tracingOrigins) ? this.config?.tracingOrigins : ['*'],
                        routingInstrumentation
                    })
                ],
                ...this.config
            });
        }
        return Promise.resolve();
    }

    /**
     * Set user for sentry trace
     */
    public setUser(user?: User): void {
        configureScope(scope => scope.setUser(user ? user : null));
    }
}
