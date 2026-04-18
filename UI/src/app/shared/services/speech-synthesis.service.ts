import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SpeechSynthesisService {
  speak(text: string): Observable<void> {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return of(undefined as void);
    }

    return new Observable<void>((observer) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => {
        observer.next(undefined);
        observer.complete();
      };
      utterance.onerror = (_event: SpeechSynthesisErrorEvent) => {
        observer.next(undefined);
        observer.complete();
      };
      window.speechSynthesis.speak(utterance);
    });
  }
}
