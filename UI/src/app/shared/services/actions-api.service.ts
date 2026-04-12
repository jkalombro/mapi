import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Action } from '../../actions/store/models/action.model';

const ACTIONS_BASE = `${environment.apiUrl}/api/v1/actions`;

@Injectable({ providedIn: 'root' })
export class ActionsApiService {
  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Action[]> {
    return this.http.get<Action[]>(ACTIONS_BASE);
  }
}
