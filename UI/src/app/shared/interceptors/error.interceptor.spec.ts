import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Router } from '@angular/router';
import { errorInterceptor } from './error.interceptor';
import { logout } from '../../store/actions/auth.actions';

describe('errorInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let store: MockStore;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        provideMockStore(),
        { provide: Router, useValue: { navigate: jest.fn() } },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    store = TestBed.inject(MockStore);
    router = TestBed.inject(Router);

    jest.spyOn(store, 'dispatch');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should dispatch logout and redirect on 401', () => {
    httpClient.get('/api/test').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/test');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(store.dispatch).toHaveBeenCalledWith(logout());
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should redirect to login on 403', () => {
    httpClient.get('/api/test').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/test');
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should re-throw the error for 5xx responses', (done) => {
    httpClient.get('/api/test').subscribe({
      error: (err: unknown) => {
        expect(err).toBeTruthy();
        done();
      },
    });

    const req = httpMock.expectOne('/api/test');
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
  });

});
