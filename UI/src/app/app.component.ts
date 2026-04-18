import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { MicIconComponent } from './shared/components/mic-icon/mic-icon.component';
import { ConfirmationDialogComponent } from './shared/components/confirmation-dialog/confirmation-dialog.component';
import { SpeechRecognitionService } from './shared/services/speech-recognition.service';
import {
  dismissConfirmation,
  startListening,
  stopListening,
  transcriptReceived,
  sendCommand,
} from './voice/store/actions/voice.actions';
import {
  selectCommandResult,
  selectIsConfirmationRequired,
  selectIsListening,
} from './voice/store/reducers/voice.reducer';
import { selectIsAuthenticated } from './store/reducers/auth.reducer';
import { logout } from './store/actions/auth.actions';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MicIconComponent, ConfirmationDialogComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  private readonly _store = inject(Store);
  private readonly _speechService = inject(SpeechRecognitionService);

  isAuthenticated = toSignal(this._store.select(selectIsAuthenticated), { initialValue: false });
  isListening = toSignal(this._store.select(selectIsListening), { initialValue: false });
  isConfirmationRequired = toSignal(this._store.select(selectIsConfirmationRequired), { initialValue: false });
  commandResult = toSignal(this._store.select(selectCommandResult), { initialValue: null });
  isSupported = this._speechService.isSupported;
  interimTranscript = this._speechService.interimTranscript;

  ngOnInit(): void {
    this._speechService.transcript$.subscribe((transcript) => {
      this._store.dispatch(transcriptReceived({ transcript }));
      this._store.dispatch(sendCommand({ transcript }));
    });
  }

  onMicClick(): void {
    if (this.isListening()) {
      this._store.dispatch(stopListening());
      this._speechService.stopListening();
    } else {
      this._store.dispatch(startListening());
      this._speechService.startListening();
    }
  }

  onConfirmAdd(): void {
    this._store.dispatch(sendCommand({ transcript: 'yes' }));
  }

  onDismissConfirmation(): void {
    this._store.dispatch(dismissConfirmation());
  }

  onLogout(): void {
    this._store.dispatch(logout());
  }
}
