import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Ion } from 'cesium';
import { AppModule } from './app/app.module';

(window as Record<string, any>)['CESIUM_BASE_URL'] = '/assets/cesium/';

// Uncomment the following line and add your personal access token if you are using Cesium Ion
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxMDE1Zjk4Yi04NTRjLTRlOTAtOTBhZi02YjQ4Zjg3ZDc4ZGQiLCJpZCI6MTgwOTQ3LCJpYXQiOjE3MDEwNzUwMTJ9.iukD3k0GzhQLkN3ZNV9JxSfwN-a2CwjjTYJEUmmEQLk';


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
