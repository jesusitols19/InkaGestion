import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportesAdministrativos } from './reportes-administrativos';

describe('ReportesAdministrativos', () => {
  let component: ReportesAdministrativos;
  let fixture: ComponentFixture<ReportesAdministrativos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportesAdministrativos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportesAdministrativos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
