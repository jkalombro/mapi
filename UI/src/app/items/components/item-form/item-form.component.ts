import { ChangeDetectionStrategy, Component, input, OnChanges, OnInit, output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Item, ItemRequest } from '../../store/models/item.model';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './item-form.component.html',
  styleUrl: './item-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemFormComponent implements OnInit, OnChanges {
  editItem = input<Item | null>(null);
  isLoading = input<boolean>(false);

  saved = output<ItemRequest>();
  cancelled = output<void>();

  form!: FormGroup;

  constructor(private readonly _fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this._fb.group({
      itemName: [this.editItem()?.itemName ?? '', [Validators.required]],
      bisayaName: [this.editItem()?.bisayaName ?? '', [Validators.required]],
      price: [this.editItem()?.price ?? null, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editItem'] && this.form) {
      const item = changes['editItem'].currentValue as Item | null;
      this.form.patchValue({
        itemName: item?.itemName ?? '',
        bisayaName: item?.bisayaName ?? '',
        price: item?.price ?? null,
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    this.saved.emit(this.form.value as ItemRequest);
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
