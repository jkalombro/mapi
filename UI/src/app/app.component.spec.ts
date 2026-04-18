import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Subject } from 'rxjs';
import { AppComponent } from './app.component';
import { SpeechRecognitionService } from './shared/services/speech-recognition.service';
import { signal } from '@angular/core';
import { selectIsListening } from './voice/store/reducers/voice.reducer';
import { selectIsAuthenticated } from './store/reducers/auth.reducer';
import { sendCommand, transcriptReceived } from './voice/store/actions/voice.actions';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let store: MockStore;
  let speechService: jest.Mocked<SpeechRecognitionService>;
  let transcript$: Subject<string>;

  const initialState = {
    auth: { user: null, token: null, isLoading: false, error: null },
    voice: {
      isListening: false,
      transcript: null,
      commandResult: null,
      isProcessing: false,
      error: null,
      pendingIntent: null,
      pendingItemName: null,
    },
  };

  beforeEach(async () => {
    transcript$ = new Subject<string>();

    const speechMock = {
      isListening: signal(false),
      isSupported: signal(true),
      interimTranscript: signal(''),
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

  it('should dispatch transcriptReceived and sendCommand when transcript$ emits', () => {
    jest.spyOn(store, 'dispatch');
    transcript$.next('how much is Milk?');
    expect(store.dispatch).toHaveBeenCalledWith(transcriptReceived({ transcript: 'how much is Milk?' }));
    expect(store.dispatch).toHaveBeenCalledWith(sendCommand({ transcript: 'how much is Milk?' }));
  });

});

