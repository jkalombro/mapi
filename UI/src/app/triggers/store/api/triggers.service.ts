import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Trigger, TriggerRequest, UpdateTriggerRequest } from '../models/trigger.model';

const TRIGGERS_BASE = `${environment.apiUrl}/api/v1/triggers`;

@Injectable({ providedIn: 'root' })
export class TriggersApiService {
  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Trigger[]> {
    return this.http.get<Trigger[]>(TRIGGERS_BASE);
  }

  create(request: TriggerRequest): Observable<Trigger> {
    return this.http.post<Trigger>(TRIGGERS_BASE, request);
  }

  update(id: string, request: UpdateTriggerRequest): Observable<Trigger> {
    return this.http.put<Trigger>(`${TRIGGERS_BASE}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${TRIGGERS_BASE}/${id}`);
  }
}
