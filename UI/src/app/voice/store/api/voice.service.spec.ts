import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { VoiceApiService } from './voice.service';
import { ConfirmAddRequest, VoiceCommandResult } from '../models/voice.model';

const BASE_URL = 'http://localhost:5000/api/v1/voice';

const mockResult: VoiceCommandResult = {
  responseText: 'Milk costs 50 pesos.',
  isAmbiguous: false,
  isConfirmationRequired: false,
  matchedNames: null,
};

describe('VoiceApiService', () => {
  let service: VoiceApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VoiceApiService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(VoiceApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('sendCommand should POST /voice/command with transcript', () => {
    let result: VoiceCommandResult | undefined;
    service.sendCommand('How much is Milk?').subscribe((r) => (result = r));

    const req = http.expectOne(`${BASE_URL}/command`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ transcript: 'How much is Milk?' });
    req.flush(mockResult);

    expect(result).toEqual(mockResult);
  });

  it('confirmAdd should POST /voice/confirm-add with request body', () => {
    const request: ConfirmAddRequest = { itemName: 'Milk', price: 50 };
    let result: VoiceCommandResult | undefined;
    service.confirmAdd(request).subscribe((r) => (result = r));

    const req = http.expectOne(`${BASE_URL}/confirm-add`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(mockResult);

    expect(result).toEqual(mockResult);
  });
});
