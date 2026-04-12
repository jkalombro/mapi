import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  OnInit,
  SimpleChanges,
  input,
  output,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Action, CreateActionRequest, UpdateActionRequest } from '../../store/models/action.model';

const ACTION_TYPES = ['Query', 'Add', 'Update', 'Remove'] as const;
const MAX_TEMPLATE_LENGTH = 500;

@Component({
  selector: 'app-action-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './action-form.component.html',
  styleUrl: './action-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionFormComponent implements OnInit, OnChanges {
  editAction = input<Action | null>(null);
  isLoading = input<boolean>(false);

  saved = output<CreateActionRequest | UpdateActionRequest>();
  cancelled = output<void>();

  readonly actionTypes = ACTION_TYPES;

  form!: FormGroup;

  constructor(private readonly _fb: FormBuilder) {}

  ngOnInit(): void {
    const isEditMode = this.editAction() !== null;
    this.form = this._fb.group({
      actionType: [
        { value: this.editAction()?.actionType ?? 'Query', disabled: isEditMode },
        [Validators.required],
      ],
      responseTemplate: [
        this.editAction()?.responseTemplate ?? '',
        [Validators.required, Validators.maxLength(MAX_TEMPLATE_LENGTH)],
      ],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editAction'] && this.form) {
      const action = changes['editAction'].currentValue as Action | null;
      const isEditMode = action !== null;
      this.form.patchValue({
        responseTemplate: action?.responseTemplate ?? '',
      });
      if (isEditMode) {
        this.form.get('actionType')?.disable();
      } else {
        this.form.get('actionType')?.enable();
      }
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const isEditMode = this.editAction() !== null;
    if (isEditMode) {
      const request: UpdateActionRequest = {
        responseTemplate: this.form.get('responseTemplate')!.value as string,
      };
      this.saved.emit(request);
    } else {
      const request: CreateActionRequest = {
        actionType: this.form.get('actionType')!.value as string,
        responseTemplate: this.form.get('responseTemplate')!.value as string,
      };
      this.saved.emit(request);
    }

    this.form.reset({ actionType: 'Query', responseTemplate: '' });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
