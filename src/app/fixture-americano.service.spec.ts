import { TestBed } from '@angular/core/testing';

import { FixtureAmericanoService } from './fixture-americano.service';

describe('FixtureAmericanoService', () => {
  let service: FixtureAmericanoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FixtureAmericanoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
