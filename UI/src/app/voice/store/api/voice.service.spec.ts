import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { VoiceApiService } from './voice.service';
import { VoiceCommandResult } from '../models/voice.model';

const BASE_URL = 'http://localhost:5000/api/v1/voice';

const mockResult: VoiceCommandResult = {
  responseText: 'Milk costs 50 pesos.',
  isAmbiguous: false,
  isConfirmationRequired: false,
  matchedNames: null,
  itemsModified: false,
  pendingIntent: null,
  pendingItemName: null,
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

  it('sendCommand should POST /voice/command with transcript only when no pending context', () => {
    let result: VoiceCommandResult | undefined;
    service.sendCommand('How much is Milk?').subscribe((r) => (result = r));

    const req = http.expectOne(`${BASE_URL}/command`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ transcript: 'How much is Milk?', pendingIntent: null, pendingItemName: null });
    req.flush(mockResult);

    expect(result).toEqual(mockResult);
  });

  it('sendCommand should POST /voice/command with pending context when provided', () => {
    let result: VoiceCommandResult | undefined;
    service.sendCommand('50', 'Add', 'Sugar').subscribe((r) => (result = r));

    const req = http.expectOne(`${BASE_URL}/command`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ transcript: '50', pendingIntent: 'Add', pendingItemName: 'Sugar' });
    req.flush(mockResult);

    expect(result).toEqual(mockResult);
  });

  it('sendCommand should normalize null/undefined pending context to null', () => {
    let result: VoiceCommandResult | undefined;
    service.sendCommand('yes', null, undefined).subscribe((r) => (result = r));

    const req = http.expectOne(`${BASE_URL}/command`);
    expect(req.request.body).toEqual({ transcript: 'yes', pendingIntent: null, pendingItemName: null });
    req.flush(mockResult);

    expect(result).toEqual(mockResult);
  });
});
