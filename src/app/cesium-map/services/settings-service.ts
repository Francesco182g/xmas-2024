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
          layer: 's2cloudless-2023',
          style: 'default',
          format: 'image/jpeg',
          tileMatrixSetID: 'WGS84',
          tilingScheme: new Cesium.GeographicTilingScheme(),
          credit: '<a class="a-light" xmlns:dct="http://purl.org/dc/terms/" href="https://s2maps.eu" property="dct:title">Sentinel-2 cloudless 2016</a> by <a class="a-light" xmlns:cc="http://creativecommons.org/ns#" href="https://eox.at" property="cc:attributionName" rel="cc:attributionURL">EOX IT Services GmbH</a> is licensed under a <a class="a-light" rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>. The required attribution including the given links is "<i><a class="a-light" xmlns:dct="http://purl.org/dc/terms/" href="https://s2maps.eu" property="dct:title">Sentinel-2 cloudless - https://s2maps.eu</a> by <a class="a-light" xmlns:cc="http://creativecommons.org/ns#" href="https://eox.at" property="cc:attributionName" rel="cc:attributionURL">EOX IT Services GmbH</a> (Contains modified Copernicus Sentinel data 2016 &amp; 2017)</i>"',
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

     set viewer(viewer) {
          this._viewer = viewer;
     }

     get viewer(): Cesium.Viewer {
          return this._viewer;
     }

     get dynamicLighting() {
          return this._dynamicLighting;
     }

     setDynamicLighting() {
          this.viewer.scene.globe.enableLighting = true;
          console.log('setDynamicLighting');
          //this.removeAllLayers();
          // The rest of the code is for dynamic lighting
          this._dynamicLighting = true;
          //this.viewer.clock.multiplier = 4000;

          const imageryLayers = this.viewer.imageryLayers;
          if (!imageryLayers.contains(this.nightLayer)) {
               console.log('setDynamicLighting - add nightLayer');
               imageryLayers.add(this.nightLayer);
          }
          if (!imageryLayers.contains(this.dayLayer)) {
               console.log('setDynamicLighting - add dayLayer');
               imageryLayers.add(this.dayLayer);
          }
          imageryLayers.lowerToBottom(this.dayLayer);

          this.dayLayer.show = this.dynamicLighting;
          this.viewer.scene.globe.enableLighting = this.dynamicLighting;
          this.viewer.clock.shouldAnimate = this.dynamicLighting;

          // If dynamic lighting is enabled, make the night imagery invisible
          // on the lit side of the globe.
          this.nightLayer.dayAlpha = this.dynamicLighting ? 0.0 : 1.0;
          console.log('setDynamicLighting');

     }

     setStaticLighting() {
          this._dynamicLighting = false;
          this.viewer.scene.globe.enableLighting = false;
          this.viewer.clock.shouldAnimate = true;
          this.viewer.imageryLayers.lowerToBottom(this.nightLayer);

     }

     setNightLayer() {
          this.removeAllLayers();
          this._nightLayer = true;
          this.viewer.imageryLayers.add(this.nightLayer);
     }

     setDayLayer() {
          this.removeAllLayers();
          this._dayLayer = true;
          this.viewer.imageryLayers.add(this.dayLayer);
     }



     removeAllLayers() {
          this.viewer.imageryLayers.remove(this.nightLayer);
          this.viewer.imageryLayers.remove(this.dayLayer);
     }

}

