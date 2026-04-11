import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ConfirmAddRequest, VoiceCommandResult } from '../models/voice.model';

const VOICE_ENDPOINTS = {
  command: `${environment.apiUrl}/api/v1/voice/command`,
  confirmAdd: `${environment.apiUrl}/api/v1/voice/confirm-add`,
} as const;

@Injectable({ providedIn: 'root' })
export class VoiceApiService {
  constructor(private readonly http: HttpClient) {}

  sendCommand(transcript: string): Observable<VoiceCommandResult> {
    return this.http.post<VoiceCommandResult>(VOICE_ENDPOINTS.command, { transcript });
  }

  confirmAdd(request: ConfirmAddRequest): Observable<VoiceCommandResult> {
    return this.http.post<VoiceCommandResult>(VOICE_ENDPOINTS.confirmAdd, request);
  }
}
