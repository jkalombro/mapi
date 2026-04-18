import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, filter, map, of, switchMap, tap, withLatestFrom } from 'rxjs';
import { SpeechSynthesisService } from '../../../shared/services/speech-synthesis.service';
import { SpeechRecognitionService } from '../../../shared/services/speech-recognition.service';
import { VoiceApiService } from '../api/voice.service';
import { commandFailure, commandSuccess, sendCommand, startListening } from '../actions/voice.actions';
import { loadItems } from '../../../items/store/actions/items.actions';
import { selectPendingState } from '../reducers/voice.reducer';

const PENDING_INTENTS_REQUIRING_VOICE = ['Add', 'Update'];

@Injectable()
export class VoiceEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly voiceService = inject(VoiceApiService);
  private readonly speechSynthesis = inject(SpeechSynthesisService);
  private readonly speechRecognition = inject(SpeechRecognitionService);

  readonly sendCommand$ = createEffect(() =>
    this.actions$.pipe(
      ofType(sendCommand),
      withLatestFrom(this.store.select(selectPendingState)),
      switchMap(([{ transcript }, { pendingIntent, pendingItemName }]) =>
        this.voiceService.sendCommand(transcript, pendingIntent, pendingItemName).pipe(
          map((result) => commandSuccess({ result })),
          catchError((error: unknown) =>
            of(commandFailure({ error: error instanceof Error ? error.message : 'Command failed.' }))
          )
        )
      )
    )
  );

  readonly speakResponse$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(commandSuccess),
        filter(({ result }) => !result.pendingIntent || !PENDING_INTENTS_REQUIRING_VOICE.includes(result.pendingIntent)),
        switchMap(({ result }) => this.speechSynthesis.speak(result.responseText))
      ),
    { dispatch: false }
  );

  readonly autoListenAfterPending$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(commandSuccess),
        filter(({ result }) => !!result.pendingIntent && PENDING_INTENTS_REQUIRING_VOICE.includes(result.pendingIntent)),
        switchMap(({ result }) =>
          this.speechSynthesis.speak(result.responseText).pipe(
            tap(() => {
              this.store.dispatch(startListening());
              this.speechRecognition.startListening();
            })
          )
        )
      ),
    { dispatch: false }
  );

  readonly refetchItemsAfterMutation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(commandSuccess),
      filter(({ result }) => result.itemsModified),
      map(() => loadItems())
    )
  );
}
