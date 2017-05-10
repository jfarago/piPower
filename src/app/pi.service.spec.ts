import { TestBed, inject } from '@angular/core/testing';

import { PiService } from './pi.service';

describe('PiService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PiService]
    });
  });

  it('should ...', inject([PiService], (service: PiService) => {
    expect(service).toBeTruthy();
  }));
});
