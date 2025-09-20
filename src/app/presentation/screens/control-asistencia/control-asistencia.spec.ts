import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlAsistencia } from './control-asistencia';

describe('ControlAsistencia', () => {
  let component: ControlAsistencia;
  let fixture: ComponentFixture<ControlAsistencia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlAsistencia]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControlAsistencia);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
