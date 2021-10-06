import { Injectable } from '@angular/core';
import { configureScope, User } from '@sentry/angular';

@Injectable({
    providedIn: 'root'
})
export class NgxSentryService {
    public setUser(user: User | null): void {
        configureScope(scope => scope.setUser(user));
    }
}
