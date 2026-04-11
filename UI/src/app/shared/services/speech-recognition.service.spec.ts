import { TestBed } from '@angular/core/testing';
import { SpeechRecognitionService } from './speech-recognition.service';

describe('SpeechRecognitionService', () => {
  let service: SpeechRecognitionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpeechRecognitionService);
  });

  afterEach(() => {
    service.ngOnDestroy();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should expose a transcript$ observable', () => {
    expect(service.transcript$).toBeDefined();
  });

  it('should expose an isListening signal', () => {
    expect(service.isListening).toBeDefined();
    expect(service.isListening()).toBe(false);
  });

  it('should expose an isSupported signal', () => {
    expect(service.isSupported).toBeDefined();
  });

  it('should detect unsupported browser when SpeechRecognition is absent', () => {
    // In jsdom (Jest), SpeechRecognition is not available
    // The service should signal false for isSupported
    expect(service.isSupported()).toBe(false);
  });

  it('should not throw when startListening is called on unsupported browser', () => {
    expect(() => service.startListening()).not.toThrow();
  });

  it('should not throw when stopListening is called without an active session', () => {
    expect(() => service.stopListening()).not.toThrow();
  });

  it('should emit transcripts through transcript$ when recognition result fires', (done) => {
    const mockRecognition = {
      lang: '',
      interimResults: true,
      maxAlternatives: 1,
      onstart: null as (() => void) | null,
      onend: null as (() => void) | null,
      onresult: null as ((event: unknown) => void) | null,
      start: jest.fn().mockImplementation(function (this: typeof mockRecognition) {
        if (this.onstart) this.onstart();
        // Simulate a result
        if (this.onresult) {
          const mockEvent = {
            results: [[{ transcript: 'How much is Milk?' }]],
          };
          this.onresult(mockEvent);
        }
      }),
      stop: jest.fn(),
    };

    (window as unknown as Record<string, unknown>)['SpeechRecognition'] = jest.fn(
      () => mockRecognition
    );

    const receivedTranscripts: string[] = [];
    service.transcript$.subscribe((t) => {
      receivedTranscripts.push(t);
      if (receivedTranscripts.length === 1) {
        expect(receivedTranscripts[0]).toBe('How much is Milk?');
        delete (window as unknown as Record<string, unknown>)['SpeechRecognition'];
        done();
      }
    });

    // Recreate service with mock in place
    const mockService = TestBed.inject(SpeechRecognitionService);
    // Manually test startListening with mocked SpeechRecognition
    (mockService as unknown as { isSupported: { set: (v: boolean) => void } }).isSupported.set(true);
    mockService.startListening();
  });
});
