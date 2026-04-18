import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { ActionsApiService } from '../../../shared/services/actions-api.service';
import { loadActions, loadActionsFailure, loadActionsSuccess } from '../actions/actions.actions';

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
}
