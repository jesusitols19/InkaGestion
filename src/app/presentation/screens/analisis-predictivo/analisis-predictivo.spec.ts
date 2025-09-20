import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalisisPredictivo } from './analisis-predictivo';

describe('AnalisisPredictivo', () => {
  let component: AnalisisPredictivo;
  let fixture: ComponentFixture<AnalisisPredictivo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalisisPredictivo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalisisPredictivo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
