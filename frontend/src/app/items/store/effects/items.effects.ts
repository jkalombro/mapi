import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { ItemsApiService } from '../api/items.service';
import { createItem, createItemFailure, createItemSuccess, deleteItem, deleteItemFailure, deleteItemSuccess, loadItems, loadItemsFailure, loadItemsSuccess, updateItem, updateItemFailure, updateItemSuccess } from '../actions/items.actions';

@Injectable()
export class ItemsEffects {
  private readonly actions$ = inject(Actions);
  private readonly itemsService = inject(ItemsApiService);

  readonly loadItems$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadItems),
      switchMap(() =>
        this.itemsService.getAll().pipe(
          map((items) => loadItemsSuccess({ items })),
          catchError((error: unknown) =>
            of(loadItemsFailure({ error: error instanceof Error ? error.message : 'Failed to load items.' }))
          )
        )
      )
    )
  );

  readonly createItem$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createItem),
      switchMap(({ request }) =>
        this.itemsService.create(request).pipe(
          map((item) => createItemSuccess({ item })),
          catchError((error: unknown) =>
            of(createItemFailure({ error: error instanceof Error ? error.message : 'Failed to create item.' }))
          )
        )
      )
    )
  );

  readonly updateItem$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateItem),
      switchMap(({ id, request }) =>
        this.itemsService.update(id, request).pipe(
          map((item) => updateItemSuccess({ item })),
          catchError((error: unknown) =>
            of(updateItemFailure({ error: error instanceof Error ? error.message : 'Failed to update item.' }))
          )
        )
      )
    )
  );

  readonly deleteItem$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteItem),
      switchMap(({ id }) =>
        this.itemsService.delete(id).pipe(
          map(() => deleteItemSuccess({ id })),
          catchError((error: unknown) =>
            of(deleteItemFailure({ error: error instanceof Error ? error.message : 'Failed to delete item.' }))
          )
        )
      )
    )
  );

}
