import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CapturasFotograficas } from './capturas-fotograficas';

describe('CapturasFotograficas', () => {
  let component: CapturasFotograficas;
  let fixture: ComponentFixture<CapturasFotograficas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CapturasFotograficas],
    }).compileComponents();

    fixture = TestBed.createComponent(CapturasFotograficas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
