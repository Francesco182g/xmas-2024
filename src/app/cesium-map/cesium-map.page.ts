import { Component, OnInit } from '@angular/core';
import * as Cesium from 'cesium';
import { SettingsService } from './services/settings-service';

@Component({
  selector: 'app-cesium-map',
  templateUrl: './cesium-map.page.html',
  styleUrls: ['./cesium-map.page.scss'],
})
export class CesiumMapPage implements OnInit {
  viewer!: Cesium.Viewer;
  santaVillage!: Cesium.Entity;
  santaReference!: Cesium.Plane;
  snow: any;
  santaEntity: Cesium.Entity | undefined;
  czmlDataSource: Cesium.CzmlDataSource | undefined;

  constructor(private settingsService: SettingsService) {

  }

  ngOnInit() {
    this.viewer = new Cesium.Viewer('cesiumContainer', {
      baseLayerPicker: false,
      geocoder: false,
      homeButton: true,
      infoBox: true,
      timeline: true,
      shouldAnimate: true,
      navigationHelpButton: true,
      navigationInstructionsInitiallyVisible: false,
      sceneModePicker: false,
      selectionIndicator: true,
      animation: false,
      fullscreenButton: false,
      vrButton: false,
      //terrain: Cesium.Terrain.fromWorldTerrain(),
    });

    // Set inizial position to Rome
    // this.viewer.camera.flyTo({
    //   destination: Cesium.Cartesian3.fromDegrees(12.4964, 41.9028, 10000000.0), // Longitude, Latitude, Height for Rome, Italy
    //   duration: 2.0 // Fly to the location in 2 seconds
    // });

    // Set the initial camera view to Rome, Italy
    const viewer = this.viewer;
    // Remove Columbus View from the Scene Mode Picker
    viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function (commandInfo) {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(12.4964, 41.9028, 10000000.0), // Longitude, Latitude, Height for Rome, Italy
        duration: 2.0 // Fly to the location in 2 seconds
      });
      commandInfo.cancel = true; // Prevent default behavior
    });

    const scene = viewer.scene;
    scene.skyAtmosphere.hueShift = -0.8;
    scene.skyAtmosphere.saturationShift = -0.7;
    scene.skyAtmosphere.brightnessShift = -0.33;
    scene.fog.density = 0.001;
    scene.fog.minimumBrightness = 0.8;
    this.settingsService.viewer = this.viewer;


    this.dynamicLighting(true);

    const position = Cesium.Cartesian3.fromDegrees(24.35, 80.00);

    const description = `<div style="font-family: Arial, sans-serif; line-height: 1.5; background-color: rgb(84, 84, 84); padding: 10px; border-radius: 10px;">
    <h2 style="color:rgb(255, 157, 161); text-align: center;">Santa's Magical House</h2>
    <div style="text-align: center; margin-bottom: 15px;">
        <img src="https://media.architecturaldigest.com/photos/584236e2ee621a2017c771c5/16:9/w_1920,c_limit/p_f_Outside_024.jpg" alt="Santa's House" style="width: 100%; max-width: 300px; border: 2px solid #ccc; border-radius: 10px;">
    </div>
    <p>Welcome to Santa's House, the heart of Christmas magic! Nestled in the snowy North Pole, this charming red-and-white cottage is where Santa and his elves prepare for the holiday season. Surrounded by a winter wonderland of twinkling lights, sparkling snow, and cheerful holiday decorations, Santa's House is a hub of festive activity.</p>
    <ul>
        <li><strong>The Workshop:</strong> A bustling space where elves craft toys for children around the world.</li>
        <li><strong>The Mailroom:</strong> A magical room filled with letters from kids, delivered straight to Santa.</li>
        <li><strong>Santa's Office:</strong> Where Santa checks his Naughty and Nice list.</li>
        <li><strong>Cozy Living Room:</strong> A warm space with a crackling fireplace, Santa's favorite chair, and milk and cookies waiting nearby.</li>
    </ul>
    <p>Step outside and you'll see the sleigh, ready for its Christmas Eve journey, and the reindeer stables, home to Rudolph and his friends.</p>
    <p style="text-align: center; font-weight: bold;">Come explore this enchanting location and feel the holiday spirit come alive! 🎅✨</p>
</div>
`;

    const url = "assets/models/santahouse.gltf";
    this.santaVillage = this.viewer.entities.add({
      name: "Santa House",
      // add info into infobox
      description: description,
      position: Cesium.Cartesian3.fromDegrees(24.35, 80.0, 0),
      model: {
        uri: url,
        scale: 60.0,
      },
    });

    const currentDate = Cesium.JulianDate.toDate(this.viewer.clock.currentTime);
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();
    if (currentMonth === 11 && (currentDay === 24 || currentDay === 25)) {
      this.trackSantaJourney(false);
    }
  }

  dynamicLighting(value: boolean) {
    this.settingsService.setDynamicLighting(value);
  }

  showSantaStatus() {
    if (this.santaEntity) {
      this.viewer.entities.remove(this.santaEntity);
    }
    this.dynamicLighting(true);
    this.resetXmas();
    //set cesium to current time
    this.viewer.clock.currentTime = Cesium.JulianDate.now();
    //if time machine is 25th December, show santa's journey\
    // if is 24 or 25 december show santa's journey
    const currentDate = Cesium.JulianDate.toDate(this.viewer.clock.currentTime);
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();
    if (currentMonth === 11 && (currentDay === 24 || currentDay === 25)) {
      this.trackSantaJourney(false);
    } else {
      this.showSantaHouse();
    }
  }

  openSettings() {
    throw new Error('Method not implemented.');
  }

  async trackSantaJourney(followSanta = true) {
    //const czml = await fetch('assets/santaTest.czml').then((res) => res.json());	// Load the CZML data
    const czml = this.getCZML();

    const viewer = this.viewer;
    const czmlDataSource = new Cesium.CzmlDataSource();
    czmlDataSource
      .load(czml)
      .then(() => {
        // Add the data source to the viewer
        viewer.dataSources.add(czmlDataSource);

        // Access the entity with ID 'path'
        this.santaEntity = czmlDataSource.entities.getById("path");

        // Imposta la camera al lato destro del modello
        const offset = new Cesium.Cartesian3(100.0, 100.0, 100.0); // Offset destro
        //viewer.camera.lookAt(entity!.position!.getValue(Cesium.JulianDate.now()) as Cesium.Cartesian3, offset);

        if (followSanta) {
          viewer.trackedEntity = this.santaEntity;
        }
      })
      .catch((error) => {
        console.error("Error loading CZML data:", error);
      });

    viewer.dataSources.add(czmlDataSource);
    this.czmlDataSource = czmlDataSource;

    //viewer.zoomTo(dataSourcePromise);
    setTimeout(() => {
      if (!followSanta) {
        // Set viewer to follow machine time
        // set current time to time machine
        console.log('Current time:', Cesium.JulianDate.toDate(viewer.clock.currentTime));
        viewer.trackedEntity = this.santaEntity;
        viewer.clock.currentTime = Cesium.JulianDate.now();

        viewer.clock.shouldAnimate = true;
      }
    }, 4000);
    //remove datasource
  }

  showSantaHouse() {
    // untrack santa entity
    if (this.santaEntity) {
      this.viewer.trackedEntity = undefined;
      this.viewer.entities.remove(this.santaEntity);
      this.santaEntity = undefined;
    }
    const scene = this.viewer.scene;
    const position = Cesium.Cartesian3.fromDegrees(24.55342053737083, 80.00416745627538, 793.5142170272596);
    scene.camera.setView({
      destination: position,
      orientation: {
        heading: 4.708730554188302,
        pitch: -0.16755400349311267,
        roll: 6.283185307179586,

      },
    });
    this.dynamicLighting(false);

    this.startSnow();
    //this.santaVillage.show = true;
  }

  saveCameraPosition(): void {
    if (this.viewer) {
      const camera = this.viewer.camera;
      const position = camera.positionCartographic;
      const cameraState = {
        longitude: Cesium.Math.toDegrees(position.longitude),
        latitude: Cesium.Math.toDegrees(position.latitude),
        height: position.height,
        heading: camera.heading,
        pitch: camera.pitch,
        roll: camera.roll
      };
      //console.log('Posizione salvata:', cameraState);
    }
  }

  resetXmas() {
    //this.santaVillage.show = false;
    this.viewer.scene.primitives.remove(this.snow);

  }


  startSnow() {
    var viewer = this.viewer;
    var snowRadius = 100000.0;
    let snowGravityScratch = new Cesium.Cartesian3();
    var scene = viewer.scene;
    var snowParticleSize = 12.0;
    var minimumSnowImageSize = new Cesium.Cartesian2(
      snowParticleSize,
      snowParticleSize,
    );
    var maximumSnowImageSize = new Cesium.Cartesian2(
      snowParticleSize * 2.0,
      snowParticleSize * 2.0,
    );
    var snowUpdate = function (particle: any, dt: any) {
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

    //scene.primitives.removeAll();
    this.snow = scene.primitives.add(
      new Cesium.ParticleSystem({
        modelMatrix: Cesium.Matrix4.fromTranslation(scene.camera.position),
        minimumSpeed: -1.0,
        maximumSpeed: 0.0,
        lifetime: 15.0,
        emitter: new Cesium.SphereEmitter(snowRadius),
        startScale: 0.5,
        endScale: 1.0,
        image: 'assets/snowflake_particle.png',
        emissionRate: 5000.0,
        startColor: Cesium.Color.WHITE.withAlpha(0.0),
        endColor: Cesium.Color.WHITE.withAlpha(1.0),
        minimumImageSize: minimumSnowImageSize,
        maximumImageSize: maximumSnowImageSize,
        updateCallback: snowUpdate,
      }),
    );
  }

  getCZML() {
    const interpolatePositions = (positions: any, intervalSeconds: any) => {
      const interpolated = [];
      for (let i = 0; i < positions.length - 4; i += 4) {
        const t0 = positions[i];
        const lon0 = positions[i + 1];
        const lat0 = positions[i + 2];
        const alt0 = positions[i + 3];
        const t1 = positions[i + 4];
        const lon1 = positions[i + 5];
        const lat1 = positions[i + 6];
        const alt1 = positions[i + 7];

        interpolated.push(t0, lon0, lat0, alt0);

        // Interpolazione lineare per i punti intermedi
        const steps = Math.ceil((t1 - t0) / intervalSeconds);
        for (let j = 1; j < steps; j++) {
          const fraction = j / steps;
          const t = t0 + fraction * (t1 - t0);
          const lon = lon0 + fraction * (lon1 - lon0);
          const lat = lat0 + fraction * (lat1 - lat0);
          const alt = alt0 + fraction * (alt1 - alt0);
          interpolated.push(t, lon, lat, alt);
        }
      }
      // Aggiungi l'ultimo punto
      interpolated.push(...positions.slice(-4));
      return interpolated;
    };

    const positions = [
      0, -157.8583, 21.3069, 200000,  // Honolulu (UTC-10)
      3600, -149.9003, 61.2181, 200000,  // Anchorage (UTC-9)
      7200, -118.2437, 34.0522, 200000,  // Los Angeles (UTC-8)
      10800, -104.9903, 39.7392, 200000,  // Denver (UTC-7)
      14400, -87.6298, 41.8781, 200000,  // Chicago (UTC-6)
      18000, -74.0060, 40.7128, 200000,  // New York (UTC-5)
      21600, -43.1729, -22.9068, 200000,  // Rio de Janeiro (UTC-3)
      25200, -15.5989, 38.7245, 200000,  // Azores (UTC-1)
      29000, -0.1278, 51.5074, 200000,  // London (UTC+0)
      29500, 10.7522, 59.9139, 200000,  // Oslo, Norway (UTC+0)
      30400, 2.3522, 48.8566, 200000,  // Paris (UTC+1)
      31400, 12.5683, 55.6761, 200000,  // Copenhagen, Denmark (UTC+1)
      32000, 12.4964, 41.9028, 200000,  // Rome, Italy (UTC+1)
      33000, 9.0579, 8.6753, 200000,  // Abuja, Nigeria (UTC+1)
      33500, 13.4050, 52.5200, 200000,  // Berlin (UTC+2)
      33700, 16.3738, 48.2082, 200000,  // Vienna, Austria (UTC+2)
      34500, 31.2357, 30.0444, 200000,  // Cairo, Egypt (UTC+2)
      35300, 18.4241, -33.9249, 200000,  // Cape Town, South Africa (UTC+2)
      36000, 39.2083, -6.7924, 200000,  // Dar es Salaam, Tanzania (UTC+3)
      37000, 28.9784, 41.0082, 200000,  // Istanbul, Turkey (UTC+2)
      38000, 30.5234, 50.4501, 200000,  // Kiev (UTC+3)
      39000, 37.9838, 23.7275, 200000,  // Athens, Greece (UTC+3)
      39600, 3.3792, 6.5244, 200000,    // Lagos, Nigeria (UTC+3)
      41200, 39.9032599, 32.5979587, 200000,  // Ankara (UTC+4)
      43200, 44.4268, 26.1025, 200000,  // Bucharest, Romania (UTC+4)
      46800, 55.2708, 25.2048, 200000,  // Dubai (UTC+5)
      47000, 61.5240, 55.7558, 200000,  // Moscow, Russia (UTC+5)
      48500, 77.2090, 28.6139, 200000,  // Delhi (UTC+5:30)
      50400, 85.3240, 27.7172, 200000,  // Kathmandu, Nepal (UTC+5:45)
      53000, 100.5018, 13.7563, 200000,  // Bangkok (UTC+7)
      56000, 106.8650, -6.1751, 200000,  // Jakarta, Indonesia (UTC+7)
      57600, 114.1694, 22.3193, 200000,  // Hong Kong (UTC+8)
      59000, 121.4737, 31.2304, 200000,  // Shanghai, China (UTC+8)
      61200, 139.6503, 35.6762, 200000,  // Tokyo (UTC+9)
      62000, 126.9780, 37.5665, 200000,  // Seoul, South Korea (UTC+9)
      64800, 151.2093, -33.8688, 200000,  // Sydney (UTC+10)
      65000, 145.7753, -16.9186, 200000,  // Cairns, Australia (UTC+10)
      67400, 174.7633, -36.8485, 200000,  // Auckland (UTC+12)
      68400, -179.2193, -16.5782, 200000,  // Suva, Fiji (UTC+12)
    ];


    const interpolatedPositions = interpolatePositions(positions, 600); // Interpola ogni 10 minuti

    return [
      {
        id: "document",
        name: "CZML Path",
        version: "1.0",
        clock: {
          interval: "2024-12-24T13:00:00Z/2024-12-25T13:59:59Z",
          currentTime: "2024-12-24T13:00:00Z",
          multiplier: 60,
        },
      },
      {
        id: "path",
        name: "Santa's Journey",
        availability: "2024-12-24T13:00:00Z/2024-12-25T23:59:59Z",
        path: {
          material: {
            polylineOutline: {
              color: { rgba: [255, 0, 255, 255] },
              outlineColor: { rgba: [0, 255, 255, 255] },
              outlineWidth: 1,
            },
          },
          width: 7,
          leadTime: 10,
          trailTime: 1000,
          resolution: 10,
        },
        model: {
          gltf: "assets/models/santatrip.gltf",
          scale: 10.0,
          minimumPixelSize: 32,
          maximumScale: 30,
          runAnimations: false,
        },
        position: {
          epoch: "2024-12-24T13:00:00Z",
          cartographicDegrees: interpolatedPositions,
        },
        orientation: {
          velocityReference: "#position",
        },
      },
    ];
  }

  // [
  //   {
  //     "id": "document",
  //     "name": "CZML Path",
  //     "version": "1.0",
  //     "clock": {
  //       "interval": "2024-12-25T00:00:00Z/2024-12-25T23:59:59Z",
  //       "currentTime": "2024-12-25T00:00:00Z",
  //       "multiplier": 60
  //     }
  //   },
  //   {
  //     "id": "path",
  //     "name": "Santa's Journey",
  //     "availability": "2024-12-25T00:00:00Z/2024-12-25T23:59:59Z",
  //     "path": {
  //       "material": {
  //         "polylineOutline": {
  //           "color": { "rgba": [255, 0, 255, 255] },
  //           "outlineColor": { "rgba": [0, 255, 255, 255] },
  //           "outlineWidth": 1
  //         }
  //       },
  //       "width": 7,
  //       "leadTime": 10,
  //       "trailTime": 1000,
  //       "resolution": 20
  //     },
  //     "model": {
  //       "gltf": "assets/models/santatrip.gltf",
  //       "scale": 10.0,
  //       "minimumPixelSize": 64,
  //       "maximumScale": 20,
  //       "runAnimations": false
  //     },
  //     "position": {
  //       "epoch": "2024-12-25T00:00:00Z",
  //       "cartographicDegrees": [
  //         10.0, 45.0, 500.0,
  //         10.1, 45.1, 500.0,
  //         10.2, 45.2, 500.0
  //       ]
  //     },
  //     "orientation": {
  //       "velocityReference": "#position"
  //     }
  //   },
  //   {
  //     "id": "polyline-offset",
  //     "name": "Path Offset",
  //     "availability": "2024-12-25T00:00:00Z/2024-12-25T23:59:59Z",
  //     "path": {
  //       "material": {
  //         "polylineOutline": {
  //           "color": { "rgba": [255, 0, 255, 255] },
  //           "outlineColor": { "rgba": [0, 255, 255, 255] },
  //           "outlineWidth": 1
  //         }
  //       },
  //       "width": 7,
  //       "leadTime": 10,
  //       "trailTime": 1000,
  //       "resolution": 20
  //     },
  //     "position": {
  //       "epoch": "2024-12-25T00:00:00Z",
  //       "cartographicDegrees": [
  //         10.0, 45.0, 550.0,
  //         10.1, 45.1, 550.0,
  //         10.2, 45.2, 550.0
  //       ]
  //     }
  //   }
  // ]

  debugCoordinates() {
    // Debug
    const positions = [
      Cesium.Cartesian3.fromDegrees(174.7633, -36.8485, 200000),  // Auckland
      Cesium.Cartesian3.fromDegrees(151.2093, -33.8688, 200000),  // Sydney
      Cesium.Cartesian3.fromDegrees(139.6503, 35.6762, 200000),   // Tokyo
      Cesium.Cartesian3.fromDegrees(114.1694, 22.3193, 200000),   // Hong Kong
      Cesium.Cartesian3.fromDegrees(100.5018, 13.7563, 200000),   // Bangkok
      Cesium.Cartesian3.fromDegrees(77.2090, 28.6139, 200000),    // Delhi
      Cesium.Cartesian3.fromDegrees(55.2708, 25.2048, 200000),    // Dubai
      Cesium.Cartesian3.fromDegrees(28.9784, 41.0082, 200000),    // Istanbul
      Cesium.Cartesian3.fromDegrees(37.6173, 55.7558, 200000),    // Moscow
      Cesium.Cartesian3.fromDegrees(24.9384, 60.1699, 200000),    // Helsinki
      Cesium.Cartesian3.fromDegrees(12.4964, 41.9028, 200000),    // Rome
      Cesium.Cartesian3.fromDegrees(-0.1278, 51.5074, 200000),    // London
      Cesium.Cartesian3.fromDegrees(-43.1729, -22.9068, 200000),  // Rio de Janeiro
      Cesium.Cartesian3.fromDegrees(-74.0060, 40.7128, 200000),   // New York
      Cesium.Cartesian3.fromDegrees(-87.6298, 41.8781, 200000),   // Chicago
      Cesium.Cartesian3.fromDegrees(-104.9903, 39.7392, 200000),  // Denver
      Cesium.Cartesian3.fromDegrees(-118.2437, 34.0522, 200000),  // Los Angeles
      Cesium.Cartesian3.fromDegrees(-149.9003, 61.2181, 200000),  // Anchorage
      Cesium.Cartesian3.fromDegrees(-157.8583, 21.3069, 200000)   // Honolulu
    ];

    // Aggiungi una polilinea che collega i punti
    // this.viewer.entities.add({
    //   polyline: {
    //     positions: positions,
    //     width: 5,
    //     material: Cesium.Color.RED,
    //     clampToGround: false
    //   }
    // });
  }
}