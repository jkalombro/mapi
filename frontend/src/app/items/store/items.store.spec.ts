import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { Observable, of, throwError } from 'rxjs';
import { Action } from '@ngrx/store';
import { ItemsEffects } from './effects/items.effects';
import { ItemsApiService } from './api/items.service';
import {
  createItem, createItemFailure, createItemSuccess,
  deleteItem, deleteItemFailure, deleteItemSuccess,
  loadItems, loadItemsFailure, loadItemsSuccess,
  selectItem,
  updateItem, updateItemFailure, updateItemSuccess,
} from './actions/items.actions';
import { initialItemsState, itemsReducer, selectAllItems, selectItemsError, selectItemsIsLoading, selectSelectedItem } from './reducers/items.reducer';
import { Item } from './models/item.model';

const mockItem: Item = {
  id: '1',
  itemName: 'Milk',
  bisayaName: 'Gatas',
  price: 50,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

// ── Reducer Tests ─────────────────────────────────────────────────────────────

describe('itemsReducer', () => {
  it('should return initial state for unknown action', () => {
    const state = itemsReducer(undefined, { type: '@@UNKNOWN' } as Action);
    expect(state).toEqual(initialItemsState);
  });

  it('should set isLoading=true on loadItems', () => {
    const state = itemsReducer(initialItemsState, loadItems());
    expect(state.isLoading).toBe(true);
  });

  it('should populate items on loadItemsSuccess', () => {
    const state = itemsReducer(initialItemsState, loadItemsSuccess({ items: [mockItem] }));
    expect(state.items).toEqual([mockItem]);
    expect(state.isLoading).toBe(false);
  });

  it('should append item on createItemSuccess', () => {
    const state = itemsReducer(initialItemsState, createItemSuccess({ item: mockItem }));
    expect(state.items).toContain(mockItem);
  });

  it('should update item in list on updateItemSuccess', () => {
    const withItems = { ...initialItemsState, items: [mockItem] };
    const updatedItem = { ...mockItem, itemName: 'Updated Milk' };
    const state = itemsReducer(withItems, updateItemSuccess({ item: updatedItem }));
    expect(state.items[0].itemName).toBe('Updated Milk');
    expect(state.selectedItem).toBeNull();
  });

  it('should remove item on deleteItemSuccess', () => {
    const withItems = { ...initialItemsState, items: [mockItem] };
    const state = itemsReducer(withItems, deleteItemSuccess({ id: '1' }));
    expect(state.items).toHaveLength(0);
  });

  it('should set error on loadItemsFailure', () => {
    const state = itemsReducer(initialItemsState, loadItemsFailure({ error: 'Network error' }));
    expect(state.error).toBe('Network error');
    expect(state.isLoading).toBe(false);
  });

  it('should set selectedItem on selectItem', () => {
    const state = itemsReducer(initialItemsState, selectItem({ item: mockItem }));
    expect(state.selectedItem).toEqual(mockItem);
  });

  it('should clear selectedItem when null is passed', () => {
    const withSelected = { ...initialItemsState, selectedItem: mockItem };
    const state = itemsReducer(withSelected, selectItem({ item: null }));
    expect(state.selectedItem).toBeNull();
  });
});

// ── Selector Tests ────────────────────────────────────────────────────────────

describe('items selectors', () => {
  it('selectAllItems should return the items array', () => {
    const state = { items: { ...initialItemsState, items: [mockItem] } };
    expect(selectAllItems(state)).toEqual([mockItem]);
  });

  it('selectItemsIsLoading should return loading state', () => {
    const state = { items: { ...initialItemsState, isLoading: true } };
    expect(selectItemsIsLoading(state)).toBe(true);
  });

  it('selectItemsError should return the error', () => {
    const state = { items: { ...initialItemsState, error: 'Error message' } };
    expect(selectItemsError(state)).toBe('Error message');
  });

  it('selectSelectedItem should return the selected item', () => {
    const state = { items: { ...initialItemsState, selectedItem: mockItem } };
    expect(selectSelectedItem(state)).toEqual(mockItem);
  });
});

// ── Effects Tests ─────────────────────────────────────────────────────────────

describe('ItemsEffects', () => {
  let actions$: Observable<Action>;
  let effects: ItemsEffects;
  let itemsServiceMock: jest.Mocked<ItemsApiService>;

  beforeEach(() => {
    itemsServiceMock = {
      getAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<ItemsApiService>;

    TestBed.configureTestingModule({
      providers: [
        ItemsEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        { provide: ItemsApiService, useValue: itemsServiceMock },
      ],
    });

    effects = TestBed.inject(ItemsEffects);
  });

  it('should dispatch loadItemsSuccess on successful load', (done) => {
    itemsServiceMock.getAll.mockReturnValue(of([mockItem]));

    actions$ = of(loadItems());

    effects.loadItems$.subscribe((action) => {
      expect(action).toEqual(loadItemsSuccess({ items: [mockItem] }));
      done();
    });
  });

  it('should dispatch loadItemsFailure on load error', (done) => {
    itemsServiceMock.getAll.mockReturnValue(throwError(() => new Error('Network error')));

    actions$ = of(loadItems());

    effects.loadItems$.subscribe((action) => {
      expect(action).toEqual(loadItemsFailure({ error: 'Network error' }));
      done();
    });
  });

  it('should dispatch createItemSuccess on successful create', (done) => {
    itemsServiceMock.create.mockReturnValue(of(mockItem));

    actions$ = of(createItem({ request: { itemName: 'Milk', bisayaName: 'Gatas', price: 50 } }));

    effects.createItem$.subscribe((action) => {
      expect(action).toEqual(createItemSuccess({ item: mockItem }));
      done();
    });
  });

  it('should dispatch createItemFailure on create error', (done) => {
    itemsServiceMock.create.mockReturnValue(throwError(() => new Error('Validation error')));

    actions$ = of(createItem({ request: { itemName: 'Milk', bisayaName: 'Gatas', price: 50 } }));

    effects.createItem$.subscribe((action) => {
      expect(action).toEqual(createItemFailure({ error: 'Validation error' }));
      done();
    });
  });

  it('should dispatch updateItemSuccess on successful update', (done) => {
    const updated = { ...mockItem, itemName: 'Updated' };
    itemsServiceMock.update.mockReturnValue(of(updated));

    actions$ = of(updateItem({ id: '1', request: { itemName: 'Updated', bisayaName: 'Gatas', price: 50 } }));

    effects.updateItem$.subscribe((action) => {
      expect(action).toEqual(updateItemSuccess({ item: updated }));
      done();
    });
  });

  it('should dispatch deleteItemSuccess on successful delete', (done) => {
    itemsServiceMock.delete.mockReturnValue(of(void 0));

    actions$ = of(deleteItem({ id: '1' }));

    effects.deleteItem$.subscribe((action) => {
      expect(action).toEqual(deleteItemSuccess({ id: '1' }));
      done();
    });
  });
});
