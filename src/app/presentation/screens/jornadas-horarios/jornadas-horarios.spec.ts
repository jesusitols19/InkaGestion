import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JornadasHorarios } from './jornadas-horarios';

describe('JornadasHorarios', () => {
  let component: JornadasHorarios;
  let fixture: ComponentFixture<JornadasHorarios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JornadasHorarios]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JornadasHorarios);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
