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
  santaVillage!: Cesium.Entity;
  santaReference!: Cesium.Plane;
  snow: any;

  constructor(private settingsService: SettingsService) {

  }

  ngOnInit() {


    this.viewer = new Cesium.Viewer('cesiumContainer', {
      baseLayerPicker: false,
      geocoder: false,
      homeButton: true,
      infoBox: true,
      timeline: true,
      shouldAnimate: true,
      navigationHelpButton: true,
      navigationInstructionsInitiallyVisible: false,
      sceneModePicker: true,
      selectionIndicator: true,
      animation: false,
      fullscreenButton: false,
      vrButton: false,
      //terrain: Cesium.Terrain.fromWorldTerrain(),
    });

    this.settingsService.viewer = this.viewer;
    this.dynamicLighting();

    const position = Cesium.Cartesian3.fromDegrees(24.35, 80.00);

    const url = "assets/models/santahouse.glb";
    this.santaVillage = (this.viewer.entities.add({
      name: url,
      position: position,
      model: {
        uri: url,
        scale: 60.0,
      },
    }));
    this.santaVillage.show = false;
  }





  dynamicLighting() {
    this.settingsService.setDynamicLighting();
  }





  enableFreeNavigation() {

  }

  showSantaStatus() {
    this.dynamicLighting();
    //this.resetXmas();
    // set cesium time to current time
    //this.viewer.clock.currentTime = Cesium.JulianDate.now();
    
    // align camera on santa


  }

  openSettings() {
    throw new Error('Method not implemented.');
  }
  trackSantaJourney() {
    
  }

  showSantaHouse() {
    const scene = this.viewer.scene;
    scene.primitives.removeAll();
    //this.santaVillage.show = true;
    //this.viewer.trackedEntity = this.santaVillage;
    //Object { longitude: 24.55342053737083, latitude: 80.00416745627538, height: 793.5142170272596, heading: 4.708730554188302, pitch: -0.16755400349311267, roll: 6.283160260312141 }
    const position = Cesium.Cartesian3.fromDegrees(24.55342053737083, 80.00416745627538, 793.5142170272596);
    scene.camera.setView({
      destination: position,
      orientation: {
        heading: 4.708730554188302,
        pitch: -0.16755400349311267,
        roll: 6.283185307179586,

      },
    });
    this.settingsService.setStaticLighting();
    scene.skyAtmosphere.hueShift = -0.8;
    scene.skyAtmosphere.saturationShift = -0.7;
    scene.skyAtmosphere.brightnessShift = -0.33;
    scene.fog.density = 0.001;
    scene.fog.minimumBrightness = 0.8;
    this.startSnow();
    this.santaVillage.show = true;
  }





  saveCameraPosition(): void {
    if (this.viewer) {
      const camera = this.viewer.camera;
      const position = camera.positionCartographic;
      const cameraState = {
        longitude: Cesium.Math.toDegrees(position.longitude),
        latitude: Cesium.Math.toDegrees(position.latitude),
        height: position.height,
        heading: camera.heading,
        pitch: camera.pitch,
        roll: camera.roll
      };
      console.log('Posizione salvata:', cameraState);
    }
  }

  resetXmas() {

  }


  startSnow() {
    const viewer = this.viewer;
    const snowRadius = 100000.0;
    let snowGravityScratch = new Cesium.Cartesian3();
    const scene = viewer.scene;
    const snowParticleSize = 12.0;
    const minimumSnowImageSize = new Cesium.Cartesian2(
      snowParticleSize,
      snowParticleSize,
    );
    const maximumSnowImageSize = new Cesium.Cartesian2(
      snowParticleSize * 2.0,
      snowParticleSize * 2.0,
    );
    const snowUpdate = function (particle: any, dt: any) {
      snowGravityScratch = Cesium.Cartesian3.normalize(
        particle.position,
        snowGravityScratch,
      );
      Cesium.Cartesian3.multiplyByScalar(
        snowGravityScratch,
        Cesium.Math.randomBetween(-30.0, -300.0),
        snowGravityScratch,
      );
      particle.velocity = Cesium.Cartesian3.add(
        particle.velocity,
        snowGravityScratch,
        particle.velocity,
      );
      const distance = Cesium.Cartesian3.distance(
        scene.camera.position,
        particle.position,
      );
      if (distance > snowRadius) {
        particle.endColor.alpha = 0.0;
      } else {
        particle.endColor.alpha = 1.0 / (distance / snowRadius + 0.1);
      }
    };

    scene.primitives.removeAll();
    this.snow = scene.primitives.add(
      new Cesium.ParticleSystem({
        modelMatrix: Cesium.Matrix4.fromTranslation(scene.camera.position),
        minimumSpeed: -1.0,
        maximumSpeed: 0.0,
        lifetime: 15.0,
        emitter: new Cesium.SphereEmitter(snowRadius),
        startScale: 0.5,
        endScale: 1.0,
        image: 'assets/snowflake_particle.png',
        emissionRate: 7000.0,
        startColor: Cesium.Color.WHITE.withAlpha(0.0),
        endColor: Cesium.Color.WHITE.withAlpha(1.0),
        minimumImageSize: minimumSnowImageSize,
        maximumImageSize: maximumSnowImageSize,
        updateCallback: snowUpdate,
      }),
    );


  }


}