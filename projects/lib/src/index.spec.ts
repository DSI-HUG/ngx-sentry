import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { TraceService } from '@sentry/angular';

import { NgxSentryModule } from './ngx-sentry.module';
import { provideSentry } from './ngx-sentry.provider';

beforeAll(() => {
    TestBed.initTestEnvironment(
        BrowserTestingModule,
        platformBrowserTesting(),
    );
});

describe('lib - NgModule approach', () => {
    let sentryModule: NgxSentryModule;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NgxSentryModule.forRoot()],
        });
        sentryModule = TestBed.inject(NgxSentryModule);
    });

    it('should create the module', () => {
        expect(sentryModule).toBeTruthy();
    });
});

describe('lib - Provider function approach', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideSentry()],
        });
    });

    it('should provide ErrorHandler and TraceService', () => {
        const errorHandler = TestBed.inject(ErrorHandler);
        const traceService = TestBed.inject(TraceService);

        expect(errorHandler).toBeTruthy();
        expect(traceService).toBeTruthy();
    });
});
