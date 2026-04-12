import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { ActionsApiService } from '../../../shared/services/actions-api.service';
import {
  createActionFailure,
  createActionSuccess,
  createNewAction,
  deleteAction,
  deleteActionFailure,
  deleteActionSuccess,
  loadActions,
  loadActionsFailure,
  loadActionsSuccess,
  updateAction,
  updateActionFailure,
  updateActionSuccess,
} from '../actions/actions.actions';

@Injectable()
export class ActionsEffects {
  private readonly actions$ = inject(Actions);
  private readonly actionsApiService = inject(ActionsApiService);

  readonly loadActions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadActions),
      switchMap(() =>
        this.actionsApiService.getAll().pipe(
          map((actions) => loadActionsSuccess({ actions })),
          catchError((error: unknown) =>
            of(loadActionsFailure({ error: error instanceof Error ? error.message : 'Failed to load actions.' }))
          )
        )
      )
    )
  );

  readonly createNewAction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createNewAction),
      switchMap(({ request }) =>
        this.actionsApiService.create(request).pipe(
          map((action) => createActionSuccess({ action })),
          catchError((error: unknown) =>
            of(createActionFailure({ error: error instanceof Error ? error.message : 'Failed to create action.' }))
          )
        )
      )
    )
  );

  readonly updateAction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateAction),
      switchMap(({ id, request }) =>
        this.actionsApiService.update(id, request).pipe(
          map((action) => updateActionSuccess({ action })),
          catchError((error: unknown) =>
            of(updateActionFailure({ error: error instanceof Error ? error.message : 'Failed to update action.' }))
          )
        )
      )
    )
  );

  readonly deleteAction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteAction),
      switchMap(({ id }) =>
        this.actionsApiService.delete(id).pipe(
          map(() => deleteActionSuccess({ id })),
          catchError((error: unknown) => {
            const conflictError = error as { status?: number; error?: { detail?: string } };
            if (conflictError?.status === 409) {
              const detail = conflictError.error?.detail ?? 'Action is linked to a trigger and cannot be deleted.';
              return of(deleteActionFailure({ error: detail }));
            }
            return of(deleteActionFailure({ error: error instanceof Error ? error.message : 'Failed to delete action.' }));
          })
        )
      )
    )
  );
}
