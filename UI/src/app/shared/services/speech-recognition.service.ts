import { Injectable, OnDestroy, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';

const SPEECH_RECOGNITION_LANG = 'en-US';

@Injectable({ providedIn: 'root' })
export class SpeechRecognitionService implements OnDestroy {
  private recognition: SpeechRecognition | null = null;
  private readonly transcriptSubject = new Subject<string>();

  readonly transcript$ = this.transcriptSubject.asObservable();
  readonly isListening = signal(false);
  readonly isSupported = signal(this.checkSupport());

  private checkSupport(): boolean {
    return typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
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
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => this.isListening.set(true);
    this.recognition.onend = () => this.isListening.set(false);

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      this.transcriptSubject.next(transcript);
    };

    this.recognition.start();
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
