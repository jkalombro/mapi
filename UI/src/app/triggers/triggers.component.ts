import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { TriggerFormComponent } from './components/trigger-form/trigger-form.component';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ModalComponent } from '../shared/components/modal/modal.component';
import {
  createTrigger,
  deleteTrigger,
  loadTriggers,
  selectTrigger,
  updateTrigger,
} from './store/actions/triggers.actions';
import { selectAllTriggers, selectSelectedTrigger, selectTriggersIsLoading } from './store/reducers/triggers.reducer';
import { Trigger, TriggerRequest } from './store/models/trigger.model';
import { loadActions } from '../actions/store/actions/actions.actions';
import { selectAllActions } from '../actions/store/reducers/actions.reducer';

@Component({
  selector: 'app-triggers',
  standalone: true,
  imports: [TriggerFormComponent, ConfirmationDialogComponent, ModalComponent],
  templateUrl: './triggers.component.html',
  styleUrl: './triggers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriggersComponent implements OnInit {
  private readonly _store = inject(Store);

  triggers = toSignal(this._store.select(selectAllTriggers), { initialValue: [] });
  isLoading = toSignal(this._store.select(selectTriggersIsLoading), { initialValue: false });
  selectedTrigger = toSignal(this._store.select(selectSelectedTrigger), { initialValue: null });
  availableActions = toSignal(this._store.select(selectAllActions), { initialValue: [] });

  showCreateModal = signal(false);
  showEditModal = signal(false);
  pendingDeleteId = signal<string | null>(null);

  ngOnInit(): void {
    this._store.dispatch(loadTriggers());
    this._store.dispatch(loadActions());
  }

  onAddTriggerClick(): void {
    this.showCreateModal.set(true);
  }

  onTriggerSaved(request: TriggerRequest): void {
    this._store.dispatch(createTrigger({ request }));
    this.showCreateModal.set(false);
  }

  onTriggerFormCancelled(): void {
    this.showCreateModal.set(false);
  }

  onEditTriggerClick(trigger: Trigger): void {
    this._store.dispatch(selectTrigger({ trigger }));
    this.showEditModal.set(true);
  }

  onTriggerEditSaved(request: TriggerRequest): void {
    const current = this.selectedTrigger();
    if (current) {
      this._store.dispatch(updateTrigger({ id: current.id, request }));
    }
    this.showEditModal.set(false);
  }

  onTriggerEditCancelled(): void {
    this._store.dispatch(selectTrigger({ trigger: null }));
    this.showEditModal.set(false);
  }

  onDeleteTrigger(id: string): void {
    this.pendingDeleteId.set(id);
  }

  onDeleteConfirmed(id: string): void {
    this._store.dispatch(deleteTrigger({ id }));
    this.pendingDeleteId.set(null);
  }

  onDeleteCancelled(): void {
    this.pendingDeleteId.set(null);
  }

  trackById(_index: number, item: Trigger): string {
    return item.id;
  }
}
