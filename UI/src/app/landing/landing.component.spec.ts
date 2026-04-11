import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { LandingComponent } from './landing.component';

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the hero section with title', () => {
    const title = fixture.debugElement.query(By.css('.hero__title'));
    expect(title.nativeElement.textContent).toBe('Mapi');
  });

  it('should render the tagline', () => {
    const tagline = fixture.debugElement.query(By.css('.hero__tagline'));
    expect(tagline).toBeTruthy();
  });

  it('should render Sign In link pointing to /auth/login', () => {
    const links = fixture.debugElement.queryAll(By.css('a[routerLink="/auth/login"]'));
    expect(links.length).toBeGreaterThan(0);
  });

  it('should render Create Account link pointing to /auth/register', () => {
    const links = fixture.debugElement.queryAll(By.css('a[routerLink="/auth/register"]'));
    expect(links.length).toBeGreaterThan(0);
  });

  it('should render all four feature cards', () => {
    const cards = fixture.debugElement.queryAll(By.css('.feature-card'));
    expect(cards.length).toBe(4);
  });

  it('should render the footer CTA section', () => {
    const cta = fixture.debugElement.query(By.css('.cta'));
    expect(cta).toBeTruthy();
  });
});
