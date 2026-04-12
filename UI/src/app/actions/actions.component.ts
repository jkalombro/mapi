import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { ModalComponent } from '../shared/components/modal/modal.component';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ActionFormComponent } from './components/action-form/action-form.component';
import {
  createNewAction,
  deleteAction,
  loadActions,
  selectAction,
  updateAction,
} from './store/actions/actions.actions';
import {
  selectAllActions,
  selectActionsError,
  selectActionsIsLoading,
  selectSelectedAction,
} from './store/reducers/actions.reducer';
import { Action, CreateActionRequest, UpdateActionRequest } from './store/models/action.model';

@Component({
  selector: 'app-actions',
  standalone: true,
  imports: [ModalComponent, ConfirmationDialogComponent, ActionFormComponent],
  templateUrl: './actions.component.html',
  styleUrl: './actions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionsComponent implements OnInit {
  private readonly _store = inject(Store);

  actions = toSignal(this._store.select(selectAllActions), { initialValue: [] });
  isLoading = toSignal(this._store.select(selectActionsIsLoading), { initialValue: false });
  error = toSignal(this._store.select(selectActionsError), { initialValue: null });
  selectedAction = toSignal(this._store.select(selectSelectedAction), { initialValue: null });

  showCreateModal = signal(false);
  showEditModal = signal(false);
  pendingDeleteId = signal<string | null>(null);

  ngOnInit(): void {
    this._store.dispatch(loadActions());
  }

  onNewActionClick(): void {
    this.showCreateModal.set(true);
  }

  onCreateSave(request: CreateActionRequest): void {
    this._store.dispatch(createNewAction({ request }));
    this.showCreateModal.set(false);
  }

  onCreateCancel(): void {
    this.showCreateModal.set(false);
  }

  onEditClick(action: Action): void {
    this._store.dispatch(selectAction({ action }));
    this.showEditModal.set(true);
  }

  onEditSave(request: UpdateActionRequest): void {
    const current = this.selectedAction();
    if (current) {
      this._store.dispatch(updateAction({ id: current.id, request }));
    }
    this.showEditModal.set(false);
  }

  onEditCancel(): void {
    this._store.dispatch(selectAction({ action: null }));
    this.showEditModal.set(false);
  }

  onDeleteClick(id: string): void {
    this.pendingDeleteId.set(id);
  }

  onDeleteConfirmed(id: string): void {
    this._store.dispatch(deleteAction({ id }));
    this.pendingDeleteId.set(null);
  }

  onDeleteCancelled(): void {
    this.pendingDeleteId.set(null);
  }

  trackById(_index: number, action: Action): string {
    return action.id;
  }
}
