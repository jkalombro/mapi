import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Subject } from 'rxjs';
import { AppComponent } from './app.component';
import { SpeechRecognitionService } from './shared/services/speech-recognition.service';
import { signal } from '@angular/core';
import { selectIsListening, selectIsConfirmationRequired, selectCommandResult } from './voice/store/reducers/voice.reducer';
import { selectIsAuthenticated } from './store/reducers/auth.reducer';
import { confirmAdd, dismissConfirmation, sendCommand, transcriptReceived } from './voice/store/actions/voice.actions';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let store: MockStore;
  let speechService: jest.Mocked<SpeechRecognitionService>;
  let transcript$: Subject<string>;

  const initialState = {
    auth: { user: null, token: null, isLoading: false, error: null },
    voice: { isListening: false, transcript: null, commandResult: null, isProcessing: false, error: null },
  };

  beforeEach(async () => {
    transcript$ = new Subject<string>();

    const speechMock = {
      isListening: signal(false),
      isSupported: signal(true),
      startListening: jest.fn(),
      stopListening: jest.fn(),
      transcript$,
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule],
      providers: [
        provideMockStore({ initialState }),
        { provide: SpeechRecognitionService, useValue: speechMock },
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    speechService = TestBed.inject(SpeechRecognitionService) as jest.Mocked<SpeechRecognitionService>;
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render the toolbar when unauthenticated', () => {
    store.overrideSelector(selectIsAuthenticated, false);
    store.refreshState();
    fixture.detectChanges();
    const toolbar = fixture.debugElement.query(By.css('.toolbar'));
    expect(toolbar).toBeNull();
  });

  it('should render the toolbar when authenticated', () => {
    store.overrideSelector(selectIsAuthenticated, true);
    store.refreshState();
    fixture.detectChanges();
    const toolbar = fixture.debugElement.query(By.css('.toolbar'));
    expect(toolbar).toBeTruthy();
  });

  it('should render router-outlet', () => {
    const routerOutlet = fixture.debugElement.query(By.css('router-outlet'));
    expect(routerOutlet).toBeTruthy();
  });

  it('should not render mic-icon when unauthenticated', () => {
    store.overrideSelector(selectIsAuthenticated, false);
    store.refreshState();
    fixture.detectChanges();
    const micIcon = fixture.debugElement.query(By.css('app-mic-icon'));
    expect(micIcon).toBeNull();
  });

  it('should render mic-icon when authenticated', () => {
    store.overrideSelector(selectIsAuthenticated, true);
    store.refreshState();
    fixture.detectChanges();
    const micIcon = fixture.debugElement.query(By.css('app-mic-icon'));
    expect(micIcon).toBeTruthy();
  });

  it('should start listening when mic icon is clicked while not listening', () => {
    component.onMicClick();
    expect(speechService.startListening).toHaveBeenCalled();
  });

  it('should stop listening when mic icon is clicked while listening', () => {
    store.overrideSelector(selectIsListening, true);
    store.refreshState();
    fixture.detectChanges();
    component.onMicClick();
    expect(speechService.stopListening).toHaveBeenCalled();
  });

  it('should show confirmation dialog when authenticated and confirmation is required', () => {
    store.overrideSelector(selectIsAuthenticated, true);
    store.overrideSelector(selectIsConfirmationRequired, true);
    store.overrideSelector(selectCommandResult, {
      responseText: 'Add rice for 50?',
      isAmbiguous: false,
      isConfirmationRequired: true,
      matchedNames: null,
    });
    store.refreshState();
    fixture.detectChanges();
    const dialog = fixture.debugElement.query(By.css('app-confirmation-dialog'));
    expect(dialog).toBeTruthy();
  });

  it('should dispatch transcriptReceived and sendCommand when transcript$ emits', () => {
    jest.spyOn(store, 'dispatch');
    transcript$.next('how much is Milk?');
    expect(store.dispatch).toHaveBeenCalledWith(transcriptReceived({ transcript: 'how much is Milk?' }));
    expect(store.dispatch).toHaveBeenCalledWith(sendCommand({ transcript: 'how much is Milk?' }));
  });

  it('onConfirmAdd should dispatch confirmAdd when commandResult has matchedNames', () => {
    jest.spyOn(store, 'dispatch');
    store.overrideSelector(selectCommandResult, {
      responseText: 'Add Milk?',
      isAmbiguous: false,
      isConfirmationRequired: true,
      matchedNames: ['Milk'],
    });
    store.refreshState();
    fixture.detectChanges();

    component.onConfirmAdd();

    expect(store.dispatch).toHaveBeenCalledWith(
      confirmAdd({ request: { itemName: 'Milk', price: 0 } })
    );
  });

  it('onConfirmAdd should not dispatch when commandResult is null', () => {
    jest.spyOn(store, 'dispatch');
    store.overrideSelector(selectCommandResult, null);
    store.refreshState();
    fixture.detectChanges();

    component.onConfirmAdd();

    expect(store.dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: confirmAdd.type }));
  });

  it('onConfirmAdd should not dispatch when matchedNames is empty', () => {
    jest.spyOn(store, 'dispatch');
    store.overrideSelector(selectCommandResult, {
      responseText: 'Ambiguous?',
      isAmbiguous: true,
      isConfirmationRequired: false,
      matchedNames: [],
    });
    store.refreshState();
    fixture.detectChanges();

    component.onConfirmAdd();

    expect(store.dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: confirmAdd.type }));
  });

  it('onDismissConfirmation should dispatch dismissConfirmation', () => {
    jest.spyOn(store, 'dispatch');
    component.onDismissConfirmation();
    expect(store.dispatch).toHaveBeenCalledWith(dismissConfirmation());
  });
});
