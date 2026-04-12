import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ActionsApiService } from './actions-api.service';
import { Action } from '../../../app/actions/store/models/action.model';
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

    it('should return an empty array when no actions exist', () => {
      service.getAll().subscribe((actions) => {
        expect(actions).toEqual([]);
      });

      const req = httpMock.expectOne(ACTIONS_BASE);
      req.flush([]);
    });
  });
});
