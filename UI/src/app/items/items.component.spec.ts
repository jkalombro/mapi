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

  it('should show item-form when showForm is true', () => {
    component.showForm.set(true);
    fixture.detectChanges();
    const form = fixture.debugElement.query(By.css('app-item-form'));
    expect(form).toBeTruthy();
  });

  it('should hide item-form by default', () => {
    const form = fixture.debugElement.query(By.css('app-item-form'));
    expect(form).toBeNull();
  });

  it('should dispatch createItem when saving new item', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    component.onSave({ itemName: 'Salt', bisayaName: 'Asin', price: 10 });
    expect(dispatchSpy).toHaveBeenCalledWith(
      createItem({ request: { itemName: 'Salt', bisayaName: 'Asin', price: 10 } })
    );
  });

  it('should dispatch updateItem when editing existing item', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    store.overrideSelector(selectSelectedItem, MOCK_ITEMS[0]);
    store.refreshState();
    fixture.detectChanges();

    component.onSave({ itemName: 'Rice', bisayaName: 'Bugas', price: 55 });

    expect(dispatchSpy).toHaveBeenCalledWith(
      updateItem({ id: '1', request: { itemName: 'Rice', bisayaName: 'Bugas', price: 55 } })
    );
  });

  it('should dispatch deleteItem with confirmation', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    component.onDeleteConfirmed('1');
    expect(dispatchSpy).toHaveBeenCalledWith(deleteItem({ id: '1' }));
  });

  it('should show error when error exists', () => {
    store.overrideSelector(selectItemsError, 'Failed to load');
    store.refreshState();
    fixture.detectChanges();
    const error = fixture.debugElement.query(By.css('.items__error'));
    expect(error).toBeTruthy();
  });

  it('should dispatch selectItem on edit', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    component.onEdit(MOCK_ITEMS[0]);
    expect(dispatchSpy).toHaveBeenCalledWith(selectItem({ item: MOCK_ITEMS[0] }));
  });
});
