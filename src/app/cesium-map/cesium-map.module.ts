import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CesiumMapPageRoutingModule } from './cesium-map-routing.module';

import { CesiumMapPage } from './cesium-map.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CesiumMapPageRoutingModule
  ],
  declarations: [CesiumMapPage]
})
export class CesiumMapPageModule {}
