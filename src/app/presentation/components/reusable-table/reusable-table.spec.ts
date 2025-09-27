import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReusableTable } from './reusable-table';

describe('ReusableTable', () => {
  let component: ReusableTable;
  let fixture: ComponentFixture<ReusableTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReusableTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReusableTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
