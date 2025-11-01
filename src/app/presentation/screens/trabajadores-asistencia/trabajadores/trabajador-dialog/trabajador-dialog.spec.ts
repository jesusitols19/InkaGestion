import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrabajadorDialog } from './trabajador-dialog';

describe('TrabajadorDialog', () => {
  let component: TrabajadorDialog;
  let fixture: ComponentFixture<TrabajadorDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrabajadorDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrabajadorDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
