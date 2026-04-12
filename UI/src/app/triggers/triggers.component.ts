import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TriggerFormComponent } from './components/trigger-form/trigger-form.component';
import { ActionLinkFormComponent } from './components/action-link-form/action-link-form.component';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ModalComponent } from '../shared/components/modal/modal.component';
import {
  createTrigger,
  deleteTrigger,
  linkAction,
  loadTriggers,
  selectTrigger,
  unlinkAction,
  updateTrigger,
} from './store/actions/triggers.actions';
import { selectAllTriggers, selectSelectedTrigger, selectTriggersIsLoading } from './store/reducers/triggers.reducer';
import { ActionLinkRequest, Trigger, TriggerRequest } from './store/models/trigger.model';
import { Action, ActionsApiService } from '../shared/services/actions-api.service';

@Component({
  selector: 'app-triggers',
  standalone: true,
  imports: [TriggerFormComponent, ActionLinkFormComponent, ConfirmationDialogComponent, ModalComponent],
  templateUrl: './triggers.component.html',
  styleUrl: './triggers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriggersComponent implements OnInit {
  private readonly _store = inject(Store);
  private readonly _actionsApiService = inject(ActionsApiService);

  triggers = toSignal(this._store.select(selectAllTriggers), { initialValue: [] });
  isLoading = toSignal(this._store.select(selectTriggersIsLoading), { initialValue: false });
  selectedTrigger = toSignal(this._store.select(selectSelectedTrigger), { initialValue: null });

  showCreateModal = signal(false);
  showEditModal = signal(false);
  linkingTriggerId = signal<string | null>(null);
  pendingDeleteId = signal<string | null>(null);
  availableActions = signal<Action[]>([]);

  constructor() {
    this._actionsApiService.getAll()
      .pipe(takeUntilDestroyed())
      .subscribe((actions) => this.availableActions.set(actions));
  }

  ngOnInit(): void {
    this._store.dispatch(loadTriggers());
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

  onLinkActionClick(triggerId: string): void {
    this.linkingTriggerId.set(triggerId);
  }

  onActionLinked(request: ActionLinkRequest): void {
    const triggerId = this.linkingTriggerId();
    if (!triggerId) {
      return;
    }
    this._store.dispatch(linkAction({ triggerId, request }));
    this.linkingTriggerId.set(null);
    this._store.dispatch(loadTriggers());
  }

  onActionLinkCancelled(): void {
    this.linkingTriggerId.set(null);
  }

  onUnlinkAction(triggerId: string, actionId: string): void {
    this._store.dispatch(unlinkAction({ triggerId, actionId }));
    this._store.dispatch(loadTriggers());
  }

  isLinkingFor(triggerId: string): boolean {
    return this.linkingTriggerId() === triggerId;
  }

  trackById(_index: number, item: Trigger): string {
    return item.id;
  }
}
