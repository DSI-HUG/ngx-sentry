import { TestBed } from '@angular/core/testing';

import { NgxSentryService } from './ngx-sentry.service';

describe('NgxSentryService', () => {
  let service: NgxSentryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxSentryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
