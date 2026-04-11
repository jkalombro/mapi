import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Item, ItemRequest } from '../models/item.model';

const ITEMS_BASE = `${environment.apiUrl}/api/v1/items`;

@Injectable({ providedIn: 'root' })
export class ItemsApiService {
  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Item[]> {
    return this.http.get<Item[]>(ITEMS_BASE);
  }

  create(request: ItemRequest): Observable<Item> {
    return this.http.post<Item>(ITEMS_BASE, request);
  }

  update(id: string, request: ItemRequest): Observable<Item> {
    return this.http.put<Item>(`${ITEMS_BASE}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${ITEMS_BASE}/${id}`);
  }
}
