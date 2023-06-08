import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacienteRegistroComponent } from './paciente-registro.component';

describe('PacienteRegistroComponent', () => {
  let component: PacienteRegistroComponent;
  let fixture: ComponentFixture<PacienteRegistroComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PacienteRegistroComponent]
    });
    fixture = TestBed.createComponent(PacienteRegistroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
