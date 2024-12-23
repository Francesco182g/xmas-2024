import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '2024trip',
    loadChildren: () => import('./cesium-map/cesium-map.module').then( m => m.CesiumMapPageModule)
  },
  {
    path: '',
    redirectTo: '2024trip',
    pathMatch: 'full'
  },
  {
    path: 'cesium-map',
    loadChildren: () => import('./cesium-map/cesium-map.module').then( m => m.CesiumMapPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
