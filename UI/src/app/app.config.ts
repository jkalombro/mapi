import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { appRoutes } from './app.routes';
import { authReducer } from './store/reducers/auth.reducer';
import { AuthEffects } from './store/effects/auth.effects';
import { authInterceptor } from './shared/interceptors/auth.interceptor';
import { errorInterceptor } from './shared/interceptors/error.interceptor';
import { voiceReducer } from './voice/store/reducers/voice.reducer';
import { VoiceEffects } from './voice/store/effects/voice.effects';
import { itemsReducer } from './items/store/reducers/items.reducer';
import { ItemsEffects } from './items/store/effects/items.effects';
import { triggersReducer } from './triggers/store/reducers/triggers.reducer';
import { TriggersEffects } from './triggers/store/effects/triggers.effects';
import { actionsReducer } from './actions/store/reducers/actions.reducer';
import { ActionsEffects } from './actions/store/effects/actions.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideStore({
      auth: authReducer,
      voice: voiceReducer,
      items: itemsReducer,
      triggers: triggersReducer,
      actions: actionsReducer,
    }),
    provideEffects([AuthEffects, VoiceEffects, ItemsEffects, TriggersEffects, ActionsEffects]),
  ],
};
