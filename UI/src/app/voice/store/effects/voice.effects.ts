import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, filter, map, of, switchMap, tap } from 'rxjs';
import { SpeechSynthesisService } from '../../../shared/services/speech-synthesis.service';
import { VoiceApiService } from '../api/voice.service';
import { commandFailure, commandSuccess, confirmAdd, confirmAddFailure, confirmAddSuccess, sendCommand } from '../actions/voice.actions';
import { loadItems } from '../../../items/store/actions/items.actions';

@Injectable()
export class VoiceEffects {
  private readonly actions$ = inject(Actions);
  private readonly voiceService = inject(VoiceApiService);
  private readonly speechSynthesis = inject(SpeechSynthesisService);

  readonly sendCommand$ = createEffect(() =>
    this.actions$.pipe(
      ofType(sendCommand),
      switchMap(({ transcript }) =>
        this.voiceService.sendCommand(transcript).pipe(
          map((result) => commandSuccess({ result })),
          catchError((error: unknown) =>
            of(commandFailure({ error: error instanceof Error ? error.message : 'Command failed.' }))
          )
        )
      )
    )
  );

  readonly confirmAdd$ = createEffect(() =>
    this.actions$.pipe(
      ofType(confirmAdd),
      switchMap(({ request }) =>
        this.voiceService.confirmAdd(request).pipe(
          map((result) => confirmAddSuccess({ result })),
          catchError((error: unknown) =>
            of(confirmAddFailure({ error: error instanceof Error ? error.message : 'Confirmation failed.' }))
          )
        )
      )
    )
  );

  readonly speakResponse$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(commandSuccess, confirmAddSuccess),
        tap(({ result }) => this.speechSynthesis.speak(result.responseText))
      ),
    { dispatch: false }
  );

  readonly refetchItemsAfterMutation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(commandSuccess, confirmAddSuccess),
      filter(({ result }) => result.itemsModified),
      map(() => loadItems())
    )
  );

}
