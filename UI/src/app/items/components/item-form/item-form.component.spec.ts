import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ItemFormComponent } from './item-form.component';
import { Item, ItemRequest } from '../../store/models/item.model';

const MOCK_ITEM: Item = {
  id: '1',
  itemName: 'Rice',
  bisayaName: 'Bugas',
  price: 50,
  createdAt: '',
  updatedAt: '',
};

describe('ItemFormComponent', () => {
  let component: ItemFormComponent;
  let fixture: ComponentFixture<ItemFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemFormComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render itemName, bisayaName, and price fields', () => {
    const itemNameInput = fixture.debugElement.query(By.css('input[formControlName="itemName"]'));
    const bisayaNameInput = fixture.debugElement.query(By.css('input[formControlName="bisayaName"]'));
    const priceInput = fixture.debugElement.query(By.css('input[formControlName="price"]'));
    expect(itemNameInput).toBeTruthy();
    expect(bisayaNameInput).toBeTruthy();
    expect(priceInput).toBeTruthy();
  });

  it('should have invalid form when empty', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('should validate required itemName', () => {
    const ctrl = component.form.get('itemName');
    ctrl?.setValue('');
    expect(ctrl?.errors?.['required']).toBeTruthy();
  });

  it('should validate required bisayaName', () => {
    const ctrl = component.form.get('bisayaName');
    ctrl?.setValue('');
    expect(ctrl?.errors?.['required']).toBeTruthy();
  });

  it('should validate price is required', () => {
    const ctrl = component.form.get('price');
    ctrl?.setValue(null);
    expect(ctrl?.errors?.['required']).toBeTruthy();
  });

  it('should validate price is non-negative', () => {
    const ctrl = component.form.get('price');
    ctrl?.setValue(-1);
    expect(ctrl?.errors?.['min']).toBeTruthy();
  });

  it('should populate form when editItem is provided', () => {
    fixture.componentRef.setInput('editItem', MOCK_ITEM);
    fixture.detectChanges();
    expect(component.form.value.itemName).toBe('Rice');
    expect(component.form.value.bisayaName).toBe('Bugas');
    expect(component.form.value.price).toBe(50);
  });

  it('should emit saved event with form data on valid submit', () => {
    const savedSpy = jest.fn();
    component.saved.subscribe(savedSpy);

    component.form.setValue({ itemName: 'Salt', bisayaName: 'Asin', price: 10 });
    component.onSubmit();

    const expected: ItemRequest = { itemName: 'Salt', bisayaName: 'Asin', price: 10 };
    expect(savedSpy).toHaveBeenCalledWith(expected);
  });

  it('should not emit if form is invalid', () => {
    const savedSpy = jest.fn();
    component.saved.subscribe(savedSpy);

    component.onSubmit();
    expect(savedSpy).not.toHaveBeenCalled();
  });

  it('should emit cancelled event when cancel is clicked', () => {
    const cancelledSpy = jest.fn();
    component.cancelled.subscribe(cancelledSpy);

    component.onCancel();
    expect(cancelledSpy).toHaveBeenCalled();
  });

  it('should show "Edit Item" title when editItem is provided', () => {
    fixture.componentRef.setInput('editItem', MOCK_ITEM);
    fixture.detectChanges();
    const title = fixture.debugElement.query(By.css('.item-form__title'));
    expect(title.nativeElement.textContent.trim()).toBe('Edit Item');
  });

  it('should show "Add Item" title when no editItem', () => {
    const title = fixture.debugElement.query(By.css('.item-form__title'));
    expect(title.nativeElement.textContent.trim()).toBe('Add Item');
  });

  it('should clear form fields when editItem changes to null via ngOnChanges', () => {
    fixture.componentRef.setInput('editItem', MOCK_ITEM);
    fixture.detectChanges();

    component.ngOnChanges({
      editItem: {
        currentValue: null,
        previousValue: MOCK_ITEM,
        firstChange: false,
        isFirstChange: () => false,
      },
    });

    expect(component.form.get('itemName')?.value).toBe('');
    expect(component.form.get('bisayaName')?.value).toBe('');
    expect(component.form.get('price')?.value).toBeNull();
  });

  it('should show loading state on submit button when isLoading', () => {
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();
    const btn = fixture.debugElement.query(By.css('button[type="submit"]'));
    expect(btn.nativeElement.disabled).toBe(true);
  });
});
