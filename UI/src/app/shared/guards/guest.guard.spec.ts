import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { guestGuard } from './guest.guard';
import { selectIsAuthenticated } from '../../store/reducers/auth.reducer';

describe('guestGuard', () => {
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

  it('should allow navigation when not authenticated', (done) => {
    store.overrideSelector(selectIsAuthenticated, false);
    store.refreshState();

    TestBed.runInInjectionContext(() => {
      const result = guestGuard();
      (result as ReturnType<typeof store.select>).subscribe((value) => {
        expect(value).toBe(true);
        done();
      });
    });
  });

  it('should redirect to items when already authenticated', (done) => {
    store.overrideSelector(selectIsAuthenticated, true);
    store.refreshState();

    TestBed.runInInjectionContext(() => {
      const result = guestGuard();
      (result as ReturnType<typeof store.select>).subscribe((value) => {
        expect(router.createUrlTree).toHaveBeenCalledWith(['/items']);
        done();
      });
    });
  });
});
