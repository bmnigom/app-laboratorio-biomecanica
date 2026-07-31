import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { EvaluacionClinica } from './evaluacion-clinica';

describe('EvaluacionClinica', () => {
  let component: EvaluacionClinica;
  let fixture: ComponentFixture<EvaluacionClinica>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluacionClinica],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(EvaluacionClinica);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
