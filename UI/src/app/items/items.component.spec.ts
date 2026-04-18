import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ItemsComponent } from './items.component';
import {
  selectAllItems,
  selectItemsIsLoading,
  selectItemsError,
  selectSelectedItem,
} from './store/reducers/items.reducer';
import { loadItems, createItem, updateItem, deleteItem, selectItem } from './store/actions/items.actions';
import { Item } from './store/models/item.model';

const MOCK_ITEMS: Item[] = [
  { id: '1', itemName: 'Rice', bisayaName: 'Bugas', price: 50, createdAt: '', updatedAt: '' },
];

describe('ItemsComponent', () => {
  let component: ItemsComponent;
  let fixture: ComponentFixture<ItemsComponent>;
  let store: MockStore;

  const initialState = {
    items: { items: [], isLoading: false, error: null, selectedItem: null },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemsComponent],
      providers: [provideMockStore({ initialState })],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(ItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    store.resetSelectors();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch loadItems on init', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    component.ngOnInit();
    expect(dispatchSpy).toHaveBeenCalledWith(loadItems());
  });

  it('should render item-list component', () => {
    const itemList = fixture.debugElement.query(By.css('app-item-list'));
    expect(itemList).toBeTruthy();
  });

  // =========================================================
  // Modal signals (replaces showForm)
  // =========================================================

  it('should NOT have showForm signal (replaced by showCreateModal and showEditModal)', () => {
    expect((component as unknown as Record<string, unknown>)['showForm']).toBeUndefined();
  });

  it('should set showCreateModal to true when "Add Item" button is clicked', () => {
    const btn = fixture.debugElement.query(By.css('.btn--primary'));
    btn.nativeElement.click();
    expect(component.showCreateModal()).toBe(true);
  });

  it('should render create modal (app-modal) when showCreateModal is true', () => {
    component.showCreateModal.set(true);
    fixture.detectChanges();
    const modals = fixture.debugElement.queryAll(By.css('app-modal'));
    expect(modals.length).toBeGreaterThan(0);
  });

  it('should render edit modal when showEditModal is true', () => {
    component.showEditModal.set(true);
    fixture.detectChanges();
    const modals = fixture.debugElement.queryAll(By.css('app-modal'));
    expect(modals.length).toBeGreaterThan(0);
  });

  // =========================================================
  // Create
  // =========================================================

  it('should dispatch createItem and close create modal on onCreateSave', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    component.showCreateModal.set(true);

    component.onCreateSave({ itemName: 'Salt', bisayaName: 'Asin', price: 10 });

    expect(dispatchSpy).toHaveBeenCalledWith(
      createItem({ request: { itemName: 'Salt', bisayaName: 'Asin', price: 10 } })
    );
    expect(component.showCreateModal()).toBe(false);
  });

  it('should close create modal on onCreateCancel', () => {
    component.showCreateModal.set(true);
    component.onCreateCancel();
    expect(component.showCreateModal()).toBe(false);
  });

  // =========================================================
  // Edit
  // =========================================================

  it('should dispatch selectItem and set showEditModal on onEdit', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    component.onEdit(MOCK_ITEMS[0]);
    expect(dispatchSpy).toHaveBeenCalledWith(selectItem({ item: MOCK_ITEMS[0] }));
    expect(component.showEditModal()).toBe(true);
  });

  it('should dispatch updateItem and close edit modal on onEditSave when selectedItem exists', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    store.overrideSelector(selectSelectedItem, MOCK_ITEMS[0]);
    store.refreshState();
    fixture.detectChanges();

    component.onEditSave({ itemName: 'Rice', bisayaName: 'Bugas', price: 55 });

    expect(dispatchSpy).toHaveBeenCalledWith(
      updateItem({ id: '1', request: { itemName: 'Rice', bisayaName: 'Bugas', price: 55 } })
    );
    expect(component.showEditModal()).toBe(false);
  });

  it('should not dispatch updateItem when selectedItem is null', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    store.overrideSelector(selectSelectedItem, null);
    store.refreshState();
    fixture.detectChanges();

    component.onEditSave({ itemName: 'Rice', bisayaName: 'Bugas', price: 55 });

    expect(dispatchSpy).not.toHaveBeenCalledWith(expect.objectContaining({ type: updateItem.type }));
    expect(component.showEditModal()).toBe(false);
  });

  it('should close edit modal on onEditCancel', () => {
    component.showEditModal.set(true);
    component.onEditCancel();
    expect(component.showEditModal()).toBe(false);
  });

  // =========================================================
  // Delete
  // =========================================================

  it('should set pendingDeleteId when onDelete is called', () => {
    component.onDelete('1');
    expect(component.pendingDeleteId()).toBe('1');
  });

  it('should dispatch deleteItem with confirmation', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    component.onDeleteConfirmed('1');
    expect(dispatchSpy).toHaveBeenCalledWith(deleteItem({ id: '1' }));
  });

  it('should clear pendingDeleteId on cancel', () => {
    component.pendingDeleteId.set('1');
    component.onDeleteCancelled();
    expect(component.pendingDeleteId()).toBeNull();
  });

  // =========================================================
  // Error
  // =========================================================

  it('should show error when error exists', () => {
    store.overrideSelector(selectItemsError, 'Failed to load');
    store.refreshState();
    fixture.detectChanges();
    const error = fixture.debugElement.query(By.css('.items__error'));
    expect(error).toBeTruthy();
  });
});
