import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeWork } from './home-work';

describe('HomeWork', () => {
  let component: HomeWork;
  let fixture: ComponentFixture<HomeWork>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeWork],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeWork);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
