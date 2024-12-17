import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import * as Cesium from 'cesium';

import { AppModule } from './app/app.module';

(window as Record<string, any>)['CESIUM_BASE_URL'] = '/assets/cesium/';
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiZDk1NTZmYy02YWFkLTQ4NDUtYTE1OC05M2U3M2Q2YjBjNDYiLCJpZCI6MTgwOTQ3LCJpYXQiOjE3MzMwNTgxNjl9.bIkd6h_vScC09yf5IPWn1mkl-w435BqCUH19yyYGRmI';
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
