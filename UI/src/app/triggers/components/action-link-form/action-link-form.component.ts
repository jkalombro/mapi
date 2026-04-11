import { ChangeDetectionStrategy, Component, input, OnInit, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Action } from '../../../shared/services/actions-api.service';
import { ActionLinkRequest } from '../../store/models/trigger.model';

@Component({
  selector: 'app-action-link-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './action-link-form.component.html',
  styleUrl: './action-link-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionLinkFormComponent implements OnInit {
  actions = input<Action[]>([]);
  isLoading = input<boolean>(false);

  linked = output<ActionLinkRequest>();
  cancelled = output<void>();

  form!: FormGroup;

  constructor(private readonly _fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this._fb.group({
      actionId: ['', [Validators.required]],
      sortOrder: [1, [Validators.required, Validators.min(1)]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    this.linked.emit(this.form.value as ActionLinkRequest);
    this.form.reset({ sortOrder: 1 });
  }

  onCancel(): void {
    this.form.reset({ sortOrder: 1 });
    this.cancelled.emit();
  }
}
