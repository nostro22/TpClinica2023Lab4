import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EspecialistaRegistroComponent } from './especialista-registro.component';

describe('EspecialistaRegistroComponent', () => {
  let component: EspecialistaRegistroComponent;
  let fixture: ComponentFixture<EspecialistaRegistroComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EspecialistaRegistroComponent]
    });
    fixture = TestBed.createComponent(EspecialistaRegistroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
