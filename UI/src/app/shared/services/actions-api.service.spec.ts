import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Action, ActionsApiService, CreateActionRequest, UpdateActionRequest } from './actions-api.service';
import { environment } from '../../../environments/environment';

const ACTIONS_BASE = `${environment.apiUrl}/api/v1/actions`;

describe('ActionsApiService', () => {
  let service: ActionsApiService;
  let httpMock: HttpTestingController;

  const mockAction: Action = {
    id: 'abc-123',
    actionType: 'Query',
    responseTemplate: 'The price of {name} is {price}.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ActionsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll()', () => {
    it('should GET /api/v1/actions and return an array of actions', () => {
      const mockList: Action[] = [mockAction];

      service.getAll().subscribe((actions) => {
        expect(actions).toEqual(mockList);
      });

      const req = httpMock.expectOne(ACTIONS_BASE);
      expect(req.request.method).toBe('GET');
      req.flush(mockList);
    });
  });

  describe('create()', () => {
    it('should POST /api/v1/actions and return the created action', () => {
      const request: CreateActionRequest = {
        actionType: 'Query',
        responseTemplate: 'The price of {name} is {price}.',
      };

      service.create(request).subscribe((action) => {
        expect(action).toEqual(mockAction);
      });

      const req = httpMock.expectOne(ACTIONS_BASE);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockAction);
    });
  });

  describe('update()', () => {
    it('should PUT /api/v1/actions/{id} and return the updated action', () => {
      const id = 'abc-123';
      const request: UpdateActionRequest = {
        responseTemplate: 'Updated template.',
      };
      const updatedAction: Action = { ...mockAction, responseTemplate: 'Updated template.' };

      service.update(id, request).subscribe((action) => {
        expect(action).toEqual(updatedAction);
      });

      const req = httpMock.expectOne(`${ACTIONS_BASE}/${id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush(updatedAction);
    });
  });

  describe('delete()', () => {
    it('should DELETE /api/v1/actions/{id} and return void', () => {
      const id = 'abc-123';
      let completed = false;

      service.delete(id).subscribe(() => {
        completed = true;
      });

      const req = httpMock.expectOne(`${ACTIONS_BASE}/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });

      expect(completed).toBe(true);
    });
  });
});
