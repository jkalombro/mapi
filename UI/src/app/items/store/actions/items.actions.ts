import { createAction, props } from '@ngrx/store';
import { Item, ItemRequest } from '../models/item.model';

export const loadItems = createAction('[Items] Load Items');
export const loadItemsSuccess = createAction('[Items] Load Items Success', props<{ items: Item[] }>());
export const loadItemsFailure = createAction('[Items] Load Items Failure', props<{ error: string }>());

export const createItem = createAction('[Items] Create Item', props<{ request: ItemRequest }>());
export const createItemSuccess = createAction('[Items] Create Item Success', props<{ item: Item }>());
export const createItemFailure = createAction('[Items] Create Item Failure', props<{ error: string }>());

export const updateItem = createAction('[Items] Update Item', props<{ id: string; request: ItemRequest }>());
export const updateItemSuccess = createAction('[Items] Update Item Success', props<{ item: Item }>());
export const updateItemFailure = createAction('[Items] Update Item Failure', props<{ error: string }>());

export const deleteItem = createAction('[Items] Delete Item', props<{ id: string }>());
export const deleteItemSuccess = createAction('[Items] Delete Item Success', props<{ id: string }>());
export const deleteItemFailure = createAction('[Items] Delete Item Failure', props<{ error: string }>());

export const selectItem = createAction('[Items] Select Item', props<{ item: Item | null }>());
