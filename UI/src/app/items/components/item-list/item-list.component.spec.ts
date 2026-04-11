import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ItemListComponent } from './item-list.component';
import { Item } from '../../store/models/item.model';

const MOCK_ITEMS: Item[] = [
  { id: '1', itemName: 'Rice', bisayaName: 'Bugas', price: 50, createdAt: '', updatedAt: '' },
  { id: '2', itemName: 'Sugar', bisayaName: 'Asukal', price: 30, createdAt: '', updatedAt: '' },
];

describe('ItemListComponent', () => {
  let component: ItemListComponent;
  let fixture: ComponentFixture<ItemListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('items', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display empty state when no items', () => {
    fixture.componentRef.setInput('items', []);
    fixture.detectChanges();
    const emptyState = fixture.debugElement.query(By.css('.item-list__empty'));
    expect(emptyState).toBeTruthy();
  });

  it('should render list of items', () => {
    fixture.componentRef.setInput('items', MOCK_ITEMS);
    fixture.detectChanges();
    const rows = fixture.debugElement.queryAll(By.css('.item-list__row'));
    expect(rows.length).toBe(2);
  });

  it('should display item name', () => {
    fixture.componentRef.setInput('items', MOCK_ITEMS);
    fixture.detectChanges();
    const firstRow = fixture.debugElement.query(By.css('.item-list__row'));
    expect(firstRow.nativeElement.textContent).toContain('Rice');
  });

  it('should display bisaya name', () => {
    fixture.componentRef.setInput('items', MOCK_ITEMS);
    fixture.detectChanges();
    const firstRow = fixture.debugElement.query(By.css('.item-list__row'));
    expect(firstRow.nativeElement.textContent).toContain('Bugas');
  });

  it('should display item price', () => {
    fixture.componentRef.setInput('items', MOCK_ITEMS);
    fixture.detectChanges();
    const firstRow = fixture.debugElement.query(By.css('.item-list__row'));
    expect(firstRow.nativeElement.textContent).toContain('50');
  });

  it('should emit editClicked with item when edit button clicked', () => {
    fixture.componentRef.setInput('items', MOCK_ITEMS);
    fixture.detectChanges();

    const editSpy = jest.fn();
    component.editClicked.subscribe(editSpy);

    const editBtn = fixture.debugElement.query(By.css('.item-list__btn--edit'));
    editBtn.nativeElement.click();

    expect(editSpy).toHaveBeenCalledWith(MOCK_ITEMS[0]);
  });

  it('should emit deleteClicked with item id when delete button clicked', () => {
    fixture.componentRef.setInput('items', MOCK_ITEMS);
    fixture.detectChanges();

    const deleteSpy = jest.fn();
    component.deleteClicked.subscribe(deleteSpy);

    const deleteBtn = fixture.debugElement.query(By.css('.item-list__btn--delete'));
    deleteBtn.nativeElement.click();

    expect(deleteSpy).toHaveBeenCalledWith('1');
  });

  it('should show loading skeleton when isLoading is true', () => {
    fixture.componentRef.setInput('items', []);
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();
    const skeleton = fixture.debugElement.query(By.css('.item-list__loading'));
    expect(skeleton).toBeTruthy();
  });
});
