import { TestBed } from '@angular/core/testing';
import { SpeechSynthesisService } from './speech-synthesis.service';

describe('SpeechSynthesisService', () => {
  let service: SpeechSynthesisService;
  let speakMock: jest.Mock;

  beforeEach(() => {
    speakMock = jest.fn();
    Object.defineProperty(window, 'speechSynthesis', {
      value: { speak: speakMock },
      writable: true,
    });

    TestBed.configureTestingModule({});
    service = TestBed.inject(SpeechSynthesisService);
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should call speechSynthesis.speak with a SpeechSynthesisUtterance', () => {
    service.speak('Hello World');

    expect(speakMock).toHaveBeenCalledTimes(1);
    const utterance = speakMock.mock.calls[0][0] as SpeechSynthesisUtterance;
    expect(utterance.text).toBe('Hello World');
  });

  it('should handle empty string without throwing', () => {
    expect(() => service.speak('')).not.toThrow();
    expect(speakMock).toHaveBeenCalledTimes(1);
  });

  it('should not throw when speechSynthesis is unavailable', () => {
    Object.defineProperty(window, 'speechSynthesis', {
      value: undefined,
      writable: true,
    });

    expect(() => service.speak('Hello')).not.toThrow();
  });
});
