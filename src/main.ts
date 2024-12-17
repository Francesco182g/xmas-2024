import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import * as Cesium from 'cesium';

import { AppModule } from './app/app.module';

(window as Record<string, any>)['CESIUM_BASE_URL'] = '/assets/cesium/';
Cesium.Ion.defaultAccessToken = '';
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
