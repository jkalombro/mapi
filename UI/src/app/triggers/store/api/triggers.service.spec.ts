import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { TriggersApiService } from './triggers.service';
import { Trigger, TriggerRequest, UpdateTriggerRequest } from '../models/trigger.model';

const BASE_URL = 'http://localhost:5000/api/v1/triggers';

const mockTrigger: Trigger = {
  id: '1',
  phrase: "What's the price of",
  actionId: 'action-1',
  actionType: 'Query',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('TriggersApiService', () => {
  let service: TriggersApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TriggersApiService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TriggersApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAll should GET /triggers', () => {
    let result: Trigger[] | undefined;
    service.getAll().subscribe((r) => (result = r));

    const req = http.expectOne(BASE_URL);
    expect(req.request.method).toBe('GET');
    req.flush([mockTrigger]);

    expect(result).toEqual([mockTrigger]);
  });

  it('create should POST /triggers with request body', () => {
    const request: TriggerRequest = { phrase: 'Check price of', actionId: 'action-1' };
    let result: Trigger | undefined;
    service.create(request).subscribe((r) => (result = r));

    const req = http.expectOne(BASE_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(mockTrigger);

    expect(result).toEqual(mockTrigger);
  });

  it('update should PUT /triggers/:id with request body', () => {
    const updateRequest: UpdateTriggerRequest = { phrase: 'Updated phrase', actionId: 'action-2' };
    let result: Trigger | undefined;
    service.update('1', updateRequest).subscribe((r) => (result = r));

    const req = http.expectOne(`${BASE_URL}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateRequest);
    req.flush({ ...mockTrigger, phrase: 'Updated phrase' });

    expect(result?.phrase).toBe('Updated phrase');
  });

  it('delete should DELETE /triggers/:id', () => {
    let called = false;
    service.delete('1').subscribe(() => (called = true));

    const req = http.expectOne(`${BASE_URL}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });

    expect(called).toBe(true);
  });
});
