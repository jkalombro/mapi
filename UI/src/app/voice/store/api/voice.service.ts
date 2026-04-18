import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { VoiceCommandResult } from '../models/voice.model';

const VOICE_COMMAND_URL = `${environment.apiUrl}/api/v1/voice/command`;

@Injectable({ providedIn: 'root' })
export class VoiceApiService {
  constructor(private readonly http: HttpClient) {}

  sendCommand(transcript: string, pendingIntent?: string | null, pendingItemName?: string | null): Observable<VoiceCommandResult> {
    return this.http.post<VoiceCommandResult>(VOICE_COMMAND_URL, {
      transcript,
      pendingIntent: pendingIntent ?? null,
      pendingItemName: pendingItemName ?? null,
    });
  }
}
