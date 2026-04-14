import { Injectable, OnDestroy, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';

const SPEECH_RECOGNITION_LANG = 'en-US';

const BEEP_START_FREQUENCY = 880;
const BEEP_END_FREQUENCY_LOW = 523;
const BEEP_END_FREQUENCY_HIGH = 659;
const BEEP_DURATION_SHORT = 0.12;
const BEEP_DURATION_LONG = 0.18;
const BEEP_GAIN = 0.25;

@Injectable({ providedIn: 'root' })
export class SpeechRecognitionService implements OnDestroy {
  private recognition: SpeechRecognition | null = null;
  private readonly transcriptSubject = new Subject<string>();

  readonly transcript$ = this.transcriptSubject.asObservable();
  readonly isListening = signal(false);
  readonly isSupported = signal(this.checkSupport());
  readonly interimTranscript = signal('');

  private checkSupport(): boolean {
    return typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  }

  private playTone(frequency: number, duration: number): Promise<void> {
    return new Promise((resolve) => {
      try {
        const ctx = new AudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

        gainNode.gain.setValueAtTime(BEEP_GAIN, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);

        oscillator.onended = () => {
          ctx.close();
          resolve();
        };
      } catch {
        resolve();
      }
    });
  }

  private playStartBeep(): Promise<void> {
    return this.playTone(BEEP_START_FREQUENCY, BEEP_DURATION_LONG);
  }

  private playEndBeep(): Promise<void> {
    return this.playTone(BEEP_END_FREQUENCY_LOW, BEEP_DURATION_SHORT)
      .then(() => this.playTone(BEEP_END_FREQUENCY_HIGH, BEEP_DURATION_SHORT));
  }

  startListening(): void {
    if (!this.isSupported()) return;

    const SpeechRecognitionImpl =
      (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition })
        .SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;

    if (!SpeechRecognitionImpl) return;

    this.recognition = new SpeechRecognitionImpl();
    this.recognition.lang = SPEECH_RECOGNITION_LANG;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => this.isListening.set(true);
    this.recognition.onend = () => {
      this.isListening.set(false);
      this.interimTranscript.set('');
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += text;
        } else {
          interim += text;
        }
      }

      this.interimTranscript.set(interim || finalTranscript);

      if (finalTranscript) {
        this.interimTranscript.set('');
        this.playEndBeep().then(() => {
          this.transcriptSubject.next(finalTranscript);
        });
      }
    };

    this.playStartBeep().then(() => {
      this.recognition?.start();
    });
  }

  stopListening(): void {
    this.recognition?.stop();
    this.isListening.set(false);
  }

  ngOnDestroy(): void {
    this.recognition?.stop();
    this.transcriptSubject.complete();
  }
}
