import { Injectable } from '@angular/core';
import * as Cesium from 'cesium';
@Injectable({
     providedIn: 'root'
})
export class SettingsService {
     private _viewer!: Cesium.Viewer;
     private _nightLayer = false;
     private _dayLayer = false;

     private dayLayer = new Cesium.ImageryLayer(new Cesium.WebMapTileServiceImageryProvider({
          url: 'https://tiles.maps.eox.at/wmts/1.0.0/WMTSCapabilities.xml',
          layer: 's2cloudless-2023',
          style: 'default',
          format: 'image/jpeg',
          tileMatrixSetID: 'WGS84',
          tilingScheme: new Cesium.GeographicTilingScheme(),
          credit: '<a class="a-light" xmlns:dct="http://purl.org/dc/terms/" href="https://s2maps.eu" property="dct:title">Sentinel-2 cloudless 2016</a> by <a class="a-light" xmlns:cc="http://creativecommons.org/ns#" href="https://eox.at" property="cc:attributionName" rel="cc:attributionURL">EOX IT Services GmbH</a> is licensed under a <a class="a-light" rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>. The required attribution including the given links is "<i><a class="a-light" xmlns:dct="http://purl.org/dc/terms/" href="https://s2maps.eu" property="dct:title">Sentinel-2 cloudless - https://s2maps.eu</a> by <a class="a-light" xmlns:cc="http://creativecommons.org/ns#" href="https://eox.at" property="cc:attributionName" rel="cc:attributionURL">EOX IT Services GmbH</a> (Contains modified Copernicus Sentinel data 2016 &amp; 2017)</i>"',
     })
     );

     private nightLayer = new Cesium.ImageryLayer(new Cesium.WebMapTileServiceImageryProvider({
          url: 'https://tiles.maps.eox.at/wmts/1.0.0/WMTSCapabilities.xml',
          layer: 'blackmarble',
          style: 'default',
          format: 'image/jpeg',
          tileMatrixSetID: 'WGS84',
          tilingScheme: new Cesium.GeographicTilingScheme(),
          credit: '<a href="https://maps.eox.at">Black Marble</a> { &copy; <a href="http://nasa.gov">NASA</a> }',
     })
     );

     constructor() { }

     set viewer(viewer) {
          this._viewer = viewer;
          if (this.nightLayer) {
               this.viewer.imageryLayers.add(this.nightLayer);
          }
          if (this.dayLayer) {
               this.viewer.imageryLayers.add(this.dayLayer);
               this.viewer.imageryLayers.lowerToBottom(this.dayLayer);
          }
     }

     get viewer(): Cesium.Viewer {
          return this._viewer;
     }


     setDayLighting() {
          this.nightLayer.show = false;
     }

     setDynamicLighting(dynamicLighting: boolean) {
          if (dynamicLighting) {
               this.nightLayer.show = dynamicLighting;
               this.dayLayer.show = dynamicLighting;

               this.viewer.scene.globe.enableLighting = dynamicLighting;
               this.viewer.clock.shouldAnimate = dynamicLighting;

               // If dynamic lighting is enabled, make the night imagery invisible
               // on the lit side of the globe.
               this.nightLayer.dayAlpha = dynamicLighting ? 0.0 : 1.0;
               //move every seconds 1 hour
               //this.viewer.clock.multiplier = 3600;
          }
          else {
               this.dayLayer.show = !dynamicLighting;
               this.nightLayer.show = dynamicLighting;
               this.viewer.scene.globe.enableLighting = false;
               this.viewer.clock.shouldAnimate = true;

          }
     }


     removeAllLayers() {
          this.viewer.imageryLayers.remove(this.nightLayer);
          this.viewer.imageryLayers.remove(this.dayLayer);
     }

}

