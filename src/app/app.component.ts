import { Component } from '@angular/core'; 
import * as Cesium from 'cesium';
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0MjJmYzczZi1kNDk1LTQwMzctODJjOS0yMDg4YjMxMDg4NmEiLCJpZCI6MTgwOTQ3LCJpYXQiOjE3MzMwNTQ4NjJ9.nyj9y_0hhi_WYmRRz7S6UMs9_IzUkjyZPFEGKyUGJd4';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor() {

   }
}
