import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { authGuard } from './auth.guard';
import { selectIsAuthenticated } from '../../store/reducers/auth.reducer';

describe('authGuard', () => {
  let store: MockStore;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({ initialState: { auth: { token: null } } }),
        { provide: Router, useValue: { createUrlTree: jest.fn((path) => path) } },
      ],
    });
    store = TestBed.inject(MockStore);
    router = TestBed.inject(Router);
  });

  it('should allow navigation when authenticated', (done) => {
    store.overrideSelector(selectIsAuthenticated, true);
    store.refreshState();

    TestBed.runInInjectionContext(() => {
      const result = authGuard();
      (result as ReturnType<typeof store.select>).subscribe((value) => {
        expect(value).toBe(true);
        done();
      });
    });
  });

  it('should redirect to login when not authenticated', (done) => {
    store.overrideSelector(selectIsAuthenticated, false);
    store.refreshState();

    TestBed.runInInjectionContext(() => {
      const result = authGuard();
      (result as ReturnType<typeof store.select>).subscribe((value) => {
        expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
        done();
      });
    });
  });
});
