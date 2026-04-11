import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import { createItem, createItemFailure, createItemSuccess, deleteItem, deleteItemFailure, deleteItemSuccess, loadItems, loadItemsFailure, loadItemsSuccess, selectItem, updateItem, updateItemFailure, updateItemSuccess } from '../actions/items.actions';
import { ItemsState } from '../models/item.model';

const ITEMS_FEATURE_KEY = 'items';

export const initialItemsState: ItemsState = {
  items: [],
  isLoading: false,
  error: null,
  selectedItem: null,
};

export const itemsReducer = createReducer(
  initialItemsState,
  on(loadItems, createItem, updateItem, deleteItem, (state) => ({ ...state, isLoading: true, error: null })),
  on(loadItemsSuccess, (state, { items }) => ({ ...state, items, isLoading: false })),
  on(createItemSuccess, (state, { item }) => ({ ...state, items: [...state.items, item], isLoading: false })),
  on(updateItemSuccess, (state, { item }) => ({
    ...state,
    items: state.items.map((i) => (i.id === item.id ? item : i)),
    isLoading: false,
    selectedItem: null,
  })),
  on(deleteItemSuccess, (state, { id }) => ({
    ...state,
    items: state.items.filter((i) => i.id !== id),
    isLoading: false,
  })),
  on(loadItemsFailure, createItemFailure, updateItemFailure, deleteItemFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),
  on(selectItem, (state, { item }) => ({ ...state, selectedItem: item }))
);

export const selectItemsState = createFeatureSelector<ItemsState>(ITEMS_FEATURE_KEY);
export const selectAllItems = createSelector(selectItemsState, (s) => s.items);
export const selectItemsIsLoading = createSelector(selectItemsState, (s) => s.isLoading);
export const selectItemsError = createSelector(selectItemsState, (s) => s.error);
export const selectSelectedItem = createSelector(selectItemsState, (s) => s.selectedItem);
