import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuariosRoles } from './usuarios-roles';

describe('UsuariosRoles', () => {
  let component: UsuariosRoles;
  let fixture: ComponentFixture<UsuariosRoles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariosRoles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsuariosRoles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
