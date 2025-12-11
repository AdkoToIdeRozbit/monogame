import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

let cameraPersp: any, cameraOrtho: any, currentCamera: any;
let scene: any, renderer: any, control: any, orbit: any, loader: GLTFLoader;

init();
render();

async function init() {
  loader = new GLTFLoader();

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const aspect = window.innerWidth / window.innerHeight;

  const frustumSize = 5;

  cameraPersp = new THREE.PerspectiveCamera(50, aspect, 0.1, 100);
  cameraOrtho = new THREE.OrthographicCamera(-frustumSize * aspect, frustumSize * aspect, frustumSize, -frustumSize, 0.1, 100);
  currentCamera = cameraPersp;

  currentCamera.position.set(5, 2.5, 5);

  scene = new THREE.Scene();
  scene.add(new THREE.GridHelper(5, 10, 0x888888, 0x444444));

  const ambientLight = new THREE.AmbientLight(0xffffff);
  scene.add(ambientLight);

  const light = new THREE.DirectionalLight(0xffffff, 4);
  light.position.set(1, 1, 1);
  scene.add(light);

  orbit = new OrbitControls(currentCamera, renderer.domElement);
  orbit.update();
  orbit.addEventListener("change", render);

  control = new TransformControls(currentCamera, renderer.domElement);
  control.addEventListener("change", render);
  control.addEventListener("dragging-changed", function (event: any) {
    orbit.enabled = !event.value;
  });

  const gltf = await loader.loadAsync("models/monotile.glb");
  gltf.scene.scale.set(0.05, 0.05, 0.05);
  gltf.scene.rotation.set(-Math.PI / 2, 0, 0);
  scene.add(gltf.scene);

  control.attach(gltf.scene);

  const gizmo = control.getHelper();
  scene.add(gizmo);

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  const aspect = window.innerWidth / window.innerHeight;

  cameraPersp.aspect = aspect;
  cameraPersp.updateProjectionMatrix();

  cameraOrtho.left = cameraOrtho.bottom * aspect;
  cameraOrtho.right = cameraOrtho.top * aspect;
  cameraOrtho.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  render();
}

function render() {
  renderer.render(scene, currentCamera);
}
