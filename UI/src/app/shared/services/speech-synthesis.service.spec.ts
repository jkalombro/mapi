import { TestBed } from '@angular/core/testing';
import { SpeechSynthesisService } from './speech-synthesis.service';

interface MockUtterance {
  text: string;
  onend: ((event: SpeechSynthesisEvent) => void) | null;
  onerror: ((event: SpeechSynthesisErrorEvent) => void) | null;
}

describe('SpeechSynthesisService', () => {
  let service: SpeechSynthesisService;
  let speakMock: jest.Mock;

  beforeEach(() => {
    speakMock = jest.fn();
    Object.defineProperty(window, 'speechSynthesis', {
      value: { speak: speakMock },
      writable: true,
    });

    (globalThis as Record<string, unknown>)['SpeechSynthesisUtterance'] = class implements MockUtterance {
      text: string;
      onend: ((event: SpeechSynthesisEvent) => void) | null = null;
      onerror: ((event: SpeechSynthesisErrorEvent) => void) | null = null;
      constructor(text: string) { this.text = text; }
    };

    TestBed.configureTestingModule({});
    service = TestBed.inject(SpeechSynthesisService);
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should call speechSynthesis.speak with a SpeechSynthesisUtterance', () => {
    service.speak('Hello World').subscribe();

    expect(speakMock).toHaveBeenCalledTimes(1);
    const utterance = speakMock.mock.calls[0][0] as SpeechSynthesisUtterance;
    expect(utterance.text).toBe('Hello World');
  });

  it('should emit and complete when utterance onend fires', (done) => {
    const result$ = service.speak('Hello World');

    result$.subscribe({
      next: () => {
        expect(speakMock).toHaveBeenCalledTimes(1);
        done();
      },
    });

    const utterance = speakMock.mock.calls[0][0] as MockUtterance;
    utterance.onend?.({} as SpeechSynthesisEvent);
  });

  it('should emit and complete when utterance onerror fires', (done) => {
    const result$ = service.speak('Hello World');

    result$.subscribe({
      next: () => {
        expect(speakMock).toHaveBeenCalledTimes(1);
        done();
      },
    });

    const utterance = speakMock.mock.calls[0][0] as MockUtterance;
    utterance.onerror?.({} as SpeechSynthesisErrorEvent);
  });

  it('should handle empty string without throwing', () => {
    expect(() => service.speak('').subscribe()).not.toThrow();
    expect(speakMock).toHaveBeenCalledTimes(1);
  });

  it('should return an Observable that completes immediately when speechSynthesis is unavailable', (done) => {
    Object.defineProperty(window, 'speechSynthesis', {
      value: undefined,
      writable: true,
    });

    service.speak('Hello').subscribe({
      next: () => done(),
    });
  });
});
