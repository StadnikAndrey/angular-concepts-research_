import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerConfigurator } from './server-configurator';

describe('ServerConfigurator', () => {
  let component: ServerConfigurator;
  let fixture: ComponentFixture<ServerConfigurator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerConfigurator],
    }).compileComponents();

    fixture = TestBed.createComponent(ServerConfigurator);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
