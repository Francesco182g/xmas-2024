import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CesiumMapPage } from './cesium-map.page';

const routes: Routes = [
  {
    path: '',
    component: CesiumMapPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CesiumMapPageRoutingModule {}
