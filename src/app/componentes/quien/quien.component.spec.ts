import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuienComponent } from './quien.component';

describe('QuienComponent', () => {
  let component: QuienComponent;
  let fixture: ComponentFixture<QuienComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QuienComponent]
    });
    fixture = TestBed.createComponent(QuienComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
