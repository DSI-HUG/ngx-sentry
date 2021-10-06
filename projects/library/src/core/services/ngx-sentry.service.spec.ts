import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';

import { NgxSentryModule } from '../ngx-sentry.module';
import { NgxSentryService } from './ngx-sentry.service';

describe('NgxSentryService', () => {
    let service: NgxSentryService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                RouterModule.forRoot([]),
                NgxSentryModule.forRoot()
            ]
        });
        service = TestBed.inject(NgxSentryService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
