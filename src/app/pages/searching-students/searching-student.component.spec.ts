import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchingStudentComponent } from './searching-student.component';

describe('SearchingStudentComponent', () => {
  let component: SearchingStudentComponent;
  let fixture: ComponentFixture<SearchingStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchingStudentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchingStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
