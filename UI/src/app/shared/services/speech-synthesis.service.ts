import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SpeechSynthesisService {
  speak(text: string): void {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }
}
