import { ComponentFixture, TestBed } from '@angular/core/testing'

import { SideboardComponent } from './sideboard.component'

describe('SideboardComponent', () => {
  let component: SideboardComponent
  let fixture: ComponentFixture<SideboardComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideboardComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(SideboardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
