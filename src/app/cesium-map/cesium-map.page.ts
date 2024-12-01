import { Component, OnInit } from '@angular/core';
import * as Cesium from 'cesium';

@Component({
  selector: 'app-cesium-map',
  templateUrl: './cesium-map.page.html',
  styleUrls: ['./cesium-map.page.scss'],
})
export class CesiumMapPage implements OnInit {
  constructor() {}

  ngOnInit() {

    const viewer = new Cesium.Viewer('cesiumContainer', {
      baseLayerPicker: true,
      geocoder: true,
      homeButton: true,
      infoBox: true,
      // terrainProvider: Cesium.createWorldTerrainAsync()
    });
  }
}