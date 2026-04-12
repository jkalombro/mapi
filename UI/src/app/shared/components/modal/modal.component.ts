import { ChangeDetectionStrategy, Component, HostListener, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
  isVisible = input<boolean>(false);
  title = input<string>('');

  closed = output<void>();

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isVisible()) {
      this.closed.emit();
    }
  }

  onBackdropClick(): void {
    this.closed.emit();
  }

  onDialogClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  onCloseClick(): void {
    this.closed.emit();
  }
}
