import { TestBed } from '@angular/core/testing';

import { NgxSentryModule } from './ngx-sentry.module';

describe('lib', () => {
    let sentyrModule: NgxSentryModule;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NgxSentryModule]
        });
        sentyrModule = TestBed.inject(NgxSentryModule);
    });

    it('should be created', () => {
        expect(sentyrModule).toBeTruthy();
    });
});
