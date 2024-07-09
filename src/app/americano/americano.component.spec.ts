import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmericanoComponent } from './americano.component';

describe('AmericanoComponent', () => {
  let component: AmericanoComponent;
  let fixture: ComponentFixture<AmericanoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AmericanoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AmericanoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
