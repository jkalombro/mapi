import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { TriggersApiService } from '../api/triggers.service';
import { createTrigger, createTriggerFailure, createTriggerSuccess, deleteTrigger, deleteTriggerFailure, deleteTriggerSuccess, linkAction, linkActionFailure, linkActionSuccess, loadTriggers, loadTriggersFailure, loadTriggersSuccess, unlinkAction, unlinkActionFailure, unlinkActionSuccess } from '../actions/triggers.actions';

@Injectable()
export class TriggersEffects {
  private readonly actions$ = inject(Actions);
  private readonly triggersService = inject(TriggersApiService);

  readonly loadTriggers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadTriggers),
      switchMap(() =>
        this.triggersService.getAll().pipe(
          map((triggers) => loadTriggersSuccess({ triggers })),
          catchError((error: unknown) =>
            of(loadTriggersFailure({ error: error instanceof Error ? error.message : 'Failed to load triggers.' }))
          )
        )
      )
    )
  );

  readonly createTrigger$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createTrigger),
      switchMap(({ request }) =>
        this.triggersService.create(request).pipe(
          map((trigger) => createTriggerSuccess({ trigger })),
          catchError((error: unknown) =>
            of(createTriggerFailure({ error: error instanceof Error ? error.message : 'Failed to create trigger.' }))
          )
        )
      )
    )
  );

  readonly deleteTrigger$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteTrigger),
      switchMap(({ id }) =>
        this.triggersService.delete(id).pipe(
          map(() => deleteTriggerSuccess({ id })),
          catchError((error: unknown) =>
            of(deleteTriggerFailure({ error: error instanceof Error ? error.message : 'Failed to delete trigger.' }))
          )
        )
      )
    )
  );

  readonly linkAction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(linkAction),
      switchMap(({ triggerId, request }) =>
        this.triggersService.linkAction(triggerId, request).pipe(
          map(() => linkActionSuccess()),
          catchError((error: unknown) =>
            of(linkActionFailure({ error: error instanceof Error ? error.message : 'Failed to link action.' }))
          )
        )
      )
    )
  );

  readonly unlinkAction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(unlinkAction),
      switchMap(({ triggerId, actionId }) =>
        this.triggersService.unlinkAction(triggerId, actionId).pipe(
          map(() => unlinkActionSuccess()),
          catchError((error: unknown) =>
            of(unlinkActionFailure({ error: error instanceof Error ? error.message : 'Failed to unlink action.' }))
          )
        )
      )
    )
  );

}
