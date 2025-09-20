import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagosAdelantos } from './pagos-adelantos';

describe('PagosAdelantos', () => {
  let component: PagosAdelantos;
  let fixture: ComponentFixture<PagosAdelantos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagosAdelantos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagosAdelantos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
