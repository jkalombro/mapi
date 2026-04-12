import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Action {
  id: string;
  actionType: string;
  responseTemplate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateActionRequest {
  actionType: string;
  responseTemplate: string;
}

export interface UpdateActionRequest {
  responseTemplate: string;
}

const ACTIONS_BASE = `${environment.apiUrl}/api/v1/actions`;

@Injectable({ providedIn: 'root' })
export class ActionsApiService {
  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Action[]> {
    return this.http.get<Action[]>(ACTIONS_BASE);
  }

  create(request: CreateActionRequest): Observable<Action> {
    return this.http.post<Action>(ACTIONS_BASE, request);
  }

  update(id: string, request: UpdateActionRequest): Observable<Action> {
    return this.http.put<Action>(`${ACTIONS_BASE}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${ACTIONS_BASE}/${id}`);
  }
}
