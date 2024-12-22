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
      sceneModePicker: true,
      selectionIndicator: true,
      animation: false,
      fullscreenButton: false,
      vrButton: false,
      //terrain: Cesium.Terrain.fromWorldTerrain(),
    });
    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(12.4964, 41.9028, 10000000.0), // Longitude, Latitude, Height for Rome, Italy
      duration: 2.0 // Fly to the location in 2 seconds
    });

    // Set the initial camera view to Rome, Italy
    const viewer = this.viewer;
    viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function (commandInfo) {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(12.4964, 41.9028, 10000000.0), // Longitude, Latitude, Height for Rome, Italy
        duration: 2.0 // Fly to the location in 2 seconds
      });
      commandInfo.cancel = true; // Prevent default behavior
    });

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

    const url = "assets/models/santahouse.glb";
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
  }





  dynamicLighting(value: boolean) {
    this.settingsService.setDynamicLighting(value);
  }


  enableFreeNavigation() {

  }

  showSantaStatus() {
    this.dynamicLighting(true);
    this.resetXmas();
    // set cesium time to current time
    //this.viewer.clock.currentTime = Cesium.JulianDate.now();
    // align camera on santa
  }

  openSettings() {
    throw new Error('Method not implemented.');
  }

  async trackSantaJourney() {
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
        const entity = czmlDataSource.entities.getById("path");

        // Aggiungi il sistema di particelle
        const particleSystem = viewer.scene.primitives.add(
          new Cesium.ParticleSystem({
            image: "assets/particles/spark.png", // Percorso all'immagine della particella
            startColor: Cesium.Color.RED.withAlpha(0.7), // Colore iniziale
            endColor: Cesium.Color.YELLOW.withAlpha(0.0), // Colore finale
            startScale: 1.0, // Scala iniziale
            endScale: 3.0, // Scala finale
            minimumParticleLife: 1.0, // Vita minima della particella
            maximumParticleLife: 2.0, // Vita massima della particella
            speed: 5.0, // Velocità delle particelle
            imageSize: new Cesium.Cartesian2(10, 10), // Dimensione delle particelle
            emissionRate: 50, // Numero di particelle emesse al secondo
            emitter: new Cesium.CircleEmitter(5.0), // Tipo di emettitore
            modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(
              Cesium.Cartesian3.fromDegrees(24.35, 80.00, 4776183.594851127) // Posizione iniziale del modello
            ),
            lifetime: 16.0, // Durata del sistema di particelle
          })
        );

        // Sincronizza la posizione del sistema di particelle con il modello
        viewer.scene.preRender.addEventListener(() => {
          const position = entity!.position!.getValue(Cesium.JulianDate.now());
          const orientation = entity!.orientation!.getValue(Cesium.JulianDate.now());

          if (position && orientation) {
            const modelMatrix = Cesium.Matrix4.fromTranslationQuaternionRotationScale(
              position,
              Cesium.Quaternion.clone(orientation),
              new Cesium.Cartesian3(1.0, 1.0, 1.0)
            );
            particleSystem.modelMatrix = modelMatrix;
          } else {
            console.log('No position or orientation');
          }
        });



        // Imposta la camera al lato destro del modello
        const offset = new Cesium.Cartesian3(100.0, 0.0, 50.0); // Offset destro
        //viewer.camera.lookAt(entity!.position!.getValue(Cesium.JulianDate.now()) as Cesium.Cartesian3, offset);

        // Set the viewer to track the entity
        viewer.trackedEntity = entity;


      })
      .catch((error) => {
        console.error("Error loading CZML data:", error);
      });

    viewer.dataSources.add(czmlDataSource);
    //viewer.zoomTo(dataSourcePromise);




  }

  showSantaHouse() {
    const scene = this.viewer.scene;
    // Aspetta il caricamento del modello
    //this.viewer.trackedEntity = this.santaVillage;
    //Object { longitude: 24.55342053737083, latitude: 80.00416745627538, height: 793.5142170272596, heading: 4.708730554188302, pitch: -0.16755400349311267, roll: 6.283160260312141 }
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
    scene.skyAtmosphere.hueShift = -0.8;
    scene.skyAtmosphere.saturationShift = -0.7;
    scene.skyAtmosphere.brightnessShift = -0.33;
    scene.fog.density = 0.001;
    scene.fog.minimumBrightness = 0.8;

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
      console.log('Posizione salvata:', cameraState);
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
    return [
      {
        id: "document",
        name: "CZML Path",
        version: "1.0",
        clock: {
          "interval": "2024-12-25T00:00:00Z/2024-12-25T23:59:59Z",
          "currentTime": "2024-12-25T00:00:00Z",
          "multiplier": 60
        },
      },
      {
        id: "path",
        name: "Santa's Journey",
        description:
          `<div style="font-family: Arial, sans-serif; line-height: 1.5; background-color: rgb(84, 84, 84); padding: 10px; border-radius: 10px;">
    <h2 style="color:rgb(255, 157, 161); text-align: center;">Santa's Christmas Eve Journey</h2>
    <div style="text-align: center; margin-bottom: 15px;">
        <img src="https://cdn.pixabay.com/photo/2019/12/14/11/07/santa-4693082_1280.jpg" alt="Santa's Journey" style="width: 100%; max-width: 300px; border: 2px solid #ccc; border-radius: 10px;">
    </div>
    <p>Join Santa on his magical Christmas Eve journey! Every year, Santa travels the globe, delivering joy and presents to children everywhere. From the moment he takes off from the snowy North Pole to his last stop under the starry skies, it’s a night of wonder and festive cheer.</p>
    <ul>
        <li><strong>The Sleigh:</strong> A marvel of Christmas engineering, powered by festive magic and guided by Rudolph’s glowing red nose.</li>
        <li><strong>The Reindeer Team:</strong> Led by Rudolph, the trusted crew of reindeer flies tirelessly through the night.</li>
        <li><strong>The Sack of Gifts:</strong> An endless bag filled with carefully crafted toys and surprises for kids around the world.</li>
        <li><strong>Stops Along the Way:</strong> Santa’s sleigh lands quietly on rooftops as he visits homes to leave presents under the tree.</li>
    </ul>
    <p>Santa’s journey is not just about delivering gifts—it’s a symbol of kindness, joy, and the spirit of Christmas. Wherever he goes, he leaves a trail of smiles, laughter, and holiday magic.</p>
    <p style="text-align: center; font-weight: bold;">Be part of the adventure and feel the magic of Santa’s journey come to life! 🎄✨</p>
</div>`,
        "availability": "2024-12-25T00:00:00Z/2024-12-25T23:59:59Z",
        path: {
          material: {
            polylineOutline: {
              color: {
                rgba: [255, 0, 255, 255],
              },
              outlineColor: {
                rgba: [0, 255, 255, 255],
              },
              outlineWidth: 1,
            },
          },
          width: 7,
          leadTime: 10,
          trailTime: 1000,
          resolution: 20,
        },
        "model": {
          "gltf": "assets/models/santatrip.glb",
          "scale": 20.0,
          "minimumPixelSize": 128,
          "maximumScale": 20,
          "runAnimations": false,
        },
        position: {
          "epoch": "2024-12-25T00:00:00Z",
          cartographicDegrees: [
            // Time (Seconds), Lon, Lat, Hei (Meters)
            0, 174.7633, -36.8485, 200000,  // Auckland
            3600, 151.2093, -33.8688, 200000,  // Sydney
            7200, 139.6503, 35.6762, 200000,  // Tokyo
            10800, 114.1694, 22.3193, 200000,  // Hong Kong
            14400, 100.5018, 13.7563, 200000,  // Bangkok
            18000, 77.2090, 28.6139, 200000,  // Delhi
            21600, 55.2708, 25.2048, 200000,  // Dubai
            25200, 37.6173, 55.7558, 200000,  // Moscow
            28800, 24.9384, 60.1699, 200000,  // Helsinki
            32400, 12.4964, 41.9028, 200000,  // Rome
            36000, -0.1278, 51.5074, 200000,  // London
            39600, -43.1729, -22.9068, 200000,  // Rio de Janeiro
            43200, -74.0060, 40.7128, 200000,  // New York
            46800, -87.6298, 41.8781, 200000,  // Chicago
            50400, -104.9903, 39.7392, 200000,  // Denver
            54000, -118.2437, 34.0522, 200000,  // Los Angeles
            57600, -149.9003, 61.2181, 200000,  // Anchorage
            61200, -157.8583, 21.3069, 200000   // Honolulu
          ],
        },
        orientation: {
          velocityReference: "#position"
        },
      },
    ];
  }

}