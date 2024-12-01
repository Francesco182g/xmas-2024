import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CesiumMapPage } from './cesium-map.page';

describe('CesiumMapPage', () => {
  let component: CesiumMapPage;
  let fixture: ComponentFixture<CesiumMapPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CesiumMapPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
