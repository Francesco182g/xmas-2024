import { Component, OnInit } from '@angular/core';
import * as Cesium from 'cesium';
import { SettingsService } from './services/settings-service';

@Component({
  selector: 'app-cesium-map',
  templateUrl: './cesium-map.page.html',
  styleUrls: ['./cesium-map.page.scss'],
})
export class CesiumMapPage implements OnInit {
  viewer!: Cesium.Viewer;
  
  constructor(private settingsService: SettingsService) { }

  ngOnInit() {


    this.viewer = new Cesium.Viewer('cesiumContainer', {
      baseLayerPicker: false,
      geocoder: false,
      homeButton: true,
      infoBox: true,
      timeline: true,
      navigationHelpButton: true,
      navigationInstructionsInitiallyVisible: false,
      sceneModePicker: true,
      selectionIndicator: true,
      animation: false,
      fullscreenButton: false,
      vrButton: false,
      baseLayer: false,

    });

    this.viewer.scene.globe.enableLighting = true;
    this.settingsService.cesiumViewer = this.viewer;
    this.dynamicLighting();
    this.settingsService.setSnow();
  }

  dynamicLighting() {
    this.settingsService.setDynamicLighting();
  }





  enableFreeNavigation() {

  }

  showSantaStatus() {

  }

  openSettings() {
    throw new Error('Method not implemented.');
  }
  trackSantaJourney() {
    throw new Error('Method not implemented.');
  }
  prepareSantaJourney() {
    throw new Error('Method not implemented.');
  }


  santaHouse() {

    this.viewer.entities.removeAll();
    const url = 'assets/models/santahouse.glb';

    const position = Cesium.Cartesian3.fromDegrees(
      -123.0744619,
      44.0503706,
      0,
    );
    const heading = Cesium.Math.toRadians(135);
    const pitch = 0;
    const roll = 0;
    const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
    const orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

    const entity = this.viewer.entities.add({
      name: url,
      position: position,
      orientation: orientation,
      model: {
        uri: url,
        minimumPixelSize: 128,
        maximumScale: 20000,
      },
    });
    this.viewer.trackedEntity = entity;

  }


  resetXmas() {

  }


}