import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-mic-icon',
  standalone: true,
  imports: [],
  templateUrl: './mic-icon.component.html',
  styleUrl: './mic-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MicIconComponent {
  isActive = input<boolean>(false);
  isDisabled = input<boolean>(false);
  isSupported = input<boolean>(true);

  clicked = output<void>();

  onClick(): void {
    this.clicked.emit();
  }
}
