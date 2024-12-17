import { Injectable } from '@angular/core';
import * as Cesium from 'cesium';
@Injectable({
     providedIn: 'root'
})
export class SettingsService {
     private _viewer!: Cesium.Viewer;
     private _nightLayer = false;
     private _dayLayer = false;
     private _dynamicLighting = false;

     private dayImagery = new Cesium.WebMapTileServiceImageryProvider({
          url: 'https://tiles.maps.eox.at/wmts/1.0.0/WMTSCapabilities.xml',
          layer: 'bluemarble',
          style: 'default',
          format: 'image/jpeg',
          tileMatrixSetID: 'WGS84',
          tilingScheme: new Cesium.GeographicTilingScheme(),
          credit: '<a href="https://maps.eox.at">Blue Marble</a> { &copy; <a href="http://nasa.gov">NASA</a> }',
     });

     private nightImagery = new Cesium.WebMapTileServiceImageryProvider({
          url: 'https://tiles.maps.eox.at/wmts/1.0.0/WMTSCapabilities.xml',
          layer: 'blackmarble',
          style: 'default',
          format: 'image/jpeg',
          tileMatrixSetID: 'WGS84',
          tilingScheme: new Cesium.GeographicTilingScheme(),
          credit: '<a href="https://maps.eox.at">Black Marble</a> { &copy; <a href="http://nasa.gov">NASA</a> }',
     });

     private nightLayer = new Cesium.ImageryLayer(this.nightImagery);
     private dayLayer = new Cesium.ImageryLayer(this.dayImagery);

     constructor() { }

     set cesiumViewer(viewer) {
          this._viewer = viewer;
     }

     get cesiumViewer(): Cesium.Viewer {
          return this._viewer;
     }

     get dynamicLighting() {
          return this._dynamicLighting;
     }

     setDynamicLighting() {
          this.removeAllLayers();
          // The rest of the code is for dynamic lighting
          this._dynamicLighting = true;
          this.cesiumViewer.clock.multiplier = 4000;

          const imageryLayers = this.cesiumViewer.imageryLayers;
          imageryLayers.add(this.nightLayer);
          imageryLayers.add(this.dayLayer);
          imageryLayers.lowerToBottom(this.dayLayer);

          this.dayLayer.show = this.dynamicLighting;
          this.cesiumViewer.scene.globe.enableLighting = this.dynamicLighting;
          //this.cesiumViewer.clock.shouldAnimate = this.dynamicLighting;

          // If dynamic lighting is enabled, make the night imagery invisible
          // on the lit side of the globe.
          this.nightLayer.dayAlpha = this.dynamicLighting ? 0.0 : 1.0;


     }
     setNightLayer() {
          this.removeAllLayers();
          this._nightLayer = true;
          this.cesiumViewer.imageryLayers.add(this.nightLayer);
     }

     setDayLayer() {
          this.removeAllLayers();
          this._dayLayer = true;
          this.cesiumViewer.imageryLayers.add(this.dayLayer);
     }

     setSnow() {
          const scene = this.cesiumViewer.scene;
          scene.globe.depthTestAgainstTerrain = true;

          // snow
          const snowParticleSize = 12.0;
          const snowRadius = 100000.0;
          const minimumSnowImageSize = new Cesium.Cartesian2(
               snowParticleSize,
               snowParticleSize,
          );
          const maximumSnowImageSize = new Cesium.Cartesian2(
               snowParticleSize * 2.0,
               snowParticleSize * 2.0,
          );
          let snowGravityScratch = new Cesium.Cartesian3();
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
          scene.primitives.add(
               new Cesium.ParticleSystem({
                    modelMatrix: Cesium.Matrix4.fromTranslation(scene.camera.position),
                    minimumSpeed: -1.0,
                    maximumSpeed: 0.0,
                    lifetime: 15.0,
                    emitter: new Cesium.SphereEmitter(snowRadius),
                    startScale: 0.5,
                    endScale: 1.0,
                    image: "../../../assets/snowflake_particle.png",
                    emissionRate: 1000.0,
                    startColor: Cesium.Color.WHITE.withAlpha(0.0),
                    endColor: Cesium.Color.WHITE.withAlpha(1.0),
                    minimumImageSize: minimumSnowImageSize,
                    maximumImageSize: maximumSnowImageSize,
                    updateCallback: snowUpdate,
               }),
          );

          scene.skyAtmosphere.hueShift = -0.8;
          scene.skyAtmosphere.saturationShift = -0.7;
          scene.skyAtmosphere.brightnessShift = -0.33;
          scene.fog.density = 0.001;
          scene.fog.minimumBrightness = 0.8;

     }




     removeAllLayers() {
          this.cesiumViewer.imageryLayers.removeAll();
     }

}

