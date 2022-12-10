const cssModule = await import("./styles/app.css", {
  assert: { type: "css" },
});
document.adoptedStyleSheets = [cssModule.default];

import * as THREE from "./build/three.module.js";
import { OrbitControls } from "./utils/OrbitControls.js";
import { FlakesTexture } from "./utils/FlakesTexture.js";
import { RGBELoader } from "./utils/RGBELoader.js";

let scene, camera, renderer, controls, pointlight;

const width = window.innerWidth;
const height = window.innerHeight;

const fov = 50,
  aspect = width / height,
  near = 1,
  far = 1000;

function init() {
  //scene
  scene = new THREE.Scene();
  //renderer
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  document.body.appendChild(renderer.domElement);

  //encoding
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

  //camera
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 0, 500);
  //controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;
  controls.enableDamping = true;
  controls.enableZoom = false;

  //light
  pointlight = new THREE.PointLight(0xffffff, 1);
  pointlight.position.set(200, 200, 200);

  //loader
  new RGBELoader()
    .setPath("textures/")
    .load("cayley_interior_1k.hdr", function (hdrmap) {
      let envmaploader = new THREE.PMREMGenerator(renderer);
      let envmap = envmaploader.fromCubemap(hdrmap);

      //wrap texture
      let texture = new THREE.CanvasTexture(new FlakesTexture());
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.x = 10;
      texture.repeat.y = 6;

      const sphereMaterial = {
        clearcoat: 1.0,
        cleacoatRoughness: 0.1,
        metalness: 0.9,
        roughness: 0.5,
        color: 0xDC3535,
        normalMap: texture,
        normalScale: new THREE.Vector2(0.15, 0.15),
        envMap: envmap.texture,
      };

      //geometry
      let geometry = new THREE.SphereGeometry(100, 64, 64);
      //material
      let material = new THREE.MeshPhysicalMaterial(sphereMaterial);
      //mesh
      let mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      // Mouse move
      function move(e) {
        mesh.rotation.x = e.pageX * 0.005;
        mesh.rotation.y = -e.pageX * 0.005;

        renderer.render(scene, camera);
      }

      document.addEventListener("mousemove", move);

      animate();
    });
}

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

init();
