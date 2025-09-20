import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministracionPlanilla } from './administracion-planilla';

describe('AdministracionPlanilla', () => {
  let component: AdministracionPlanilla;
  let fixture: ComponentFixture<AdministracionPlanilla>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdministracionPlanilla]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdministracionPlanilla);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
