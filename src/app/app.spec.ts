import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  it('creates the administrative shell', async () => {
    await TestBed.configureTestingModule({ imports: [App], providers: [provideRouter([])] }).compileComponents();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Unidades organizacionais');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Árvore organizacional');
    expect((fixture.nativeElement as HTMLElement).querySelector('mat-sidenav-container')).not.toBeNull();
  });

  it('expõe as rotas administrativas e alterna o menu lateral', async () => {
    await TestBed.configureTestingModule({ imports: [App], providers: [provideRouter([])] }).compileComponents();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('a[routerLink]').length).toBe(3);
    (element.querySelector('button[aria-label="Alternar menu"]') as HTMLButtonElement).click();
    fixture.detectChanges();
  });
});
