import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { AppComponent } from './app.component';
import { SpeechRecognitionService } from './shared/services/speech-recognition.service';
import { signal } from '@angular/core';
import { selectIsListening, selectIsConfirmationRequired, selectCommandResult } from './voice/store/reducers/voice.reducer';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let store: MockStore;
  let speechService: jest.Mocked<SpeechRecognitionService>;

  const initialState = {
    auth: { user: null, token: null, isLoading: false, error: null },
    voice: { isListening: false, transcript: null, commandResult: null, isProcessing: false, error: null },
  };

  beforeEach(async () => {
    const speechMock = {
      isListening: signal(false),
      isSupported: signal(true),
      startListening: jest.fn(),
      stopListening: jest.fn(),
      transcript$: { subscribe: jest.fn() },
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

  it('should render the toolbar', () => {
    const toolbar = fixture.debugElement.query(By.css('.toolbar'));
    expect(toolbar).toBeTruthy();
  });

  it('should render router-outlet', () => {
    const routerOutlet = fixture.debugElement.query(By.css('router-outlet'));
    expect(routerOutlet).toBeTruthy();
  });

  it('should render the mic-icon component', () => {
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

  it('should show confirmation dialog when confirmation is required', () => {
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
});
