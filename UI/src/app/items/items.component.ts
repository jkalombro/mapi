import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { ItemListComponent } from './components/item-list/item-list.component';
import { ItemFormComponent } from './components/item-form/item-form.component';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ModalComponent } from '../shared/components/modal/modal.component';
import { createItem, deleteItem, loadItems, selectItem, updateItem } from './store/actions/items.actions';
import { selectAllItems, selectItemsError, selectItemsIsLoading, selectSelectedItem } from './store/reducers/items.reducer';
import { Item, ItemRequest } from './store/models/item.model';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [ItemListComponent, ItemFormComponent, ConfirmationDialogComponent, ModalComponent],
  templateUrl: './items.component.html',
  styleUrl: './items.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsComponent implements OnInit {
  private readonly _store = inject(Store);

  items = toSignal(this._store.select(selectAllItems), { initialValue: [] });
  isLoading = toSignal(this._store.select(selectItemsIsLoading), { initialValue: false });
  error = toSignal(this._store.select(selectItemsError), { initialValue: null });
  selectedItem = toSignal(this._store.select(selectSelectedItem), { initialValue: null });

  showCreateModal = signal(false);
  showEditModal = signal(false);
  pendingDeleteId = signal<string | null>(null);

  ngOnInit(): void {
    this._store.dispatch(loadItems());
  }

  onAddClick(): void {
    this._store.dispatch(selectItem({ item: null }));
    this.showCreateModal.set(true);
  }

  onEdit(item: Item): void {
    this._store.dispatch(selectItem({ item }));
    this.showEditModal.set(true);
  }

  onCreateSave(request: ItemRequest): void {
    this._store.dispatch(createItem({ request }));
    this.showCreateModal.set(false);
  }

  onCreateCancel(): void {
    this._store.dispatch(selectItem({ item: null }));
    this.showCreateModal.set(false);
  }

  onEditSave(request: ItemRequest): void {
    const current = this.selectedItem();
    if (current) {
      this._store.dispatch(updateItem({ id: current.id, request }));
    }
    this.showEditModal.set(false);
  }

  onEditCancel(): void {
    this._store.dispatch(selectItem({ item: null }));
    this.showEditModal.set(false);
  }

  onDelete(id: string): void {
    this.pendingDeleteId.set(id);
  }

  onDeleteConfirmed(id: string): void {
    this._store.dispatch(deleteItem({ id }));
    this.pendingDeleteId.set(null);
  }

  onDeleteCancelled(): void {
    this.pendingDeleteId.set(null);
  }
}
