import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

let cameraPersp: any, cameraOrtho: any, currentCamera: any;
let scene: any, renderer: any, control: TransformControls, control2: TransformControls, orbit: any, loader: GLTFLoader;

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

  control2 = new TransformControls(currentCamera, renderer.domElement);
  control2.addEventListener("change", render);
  control2.addEventListener("dragging-changed", function (event: any) {
    orbit.enabled = !event.value;
  });

  const gltf = await loader.loadAsync("models/monotile.glb");
  const tile = gltf.scene;
  const tile2 = tile.clone();

  tile.scale.set(0.05, 0.05, 0.05);
  tile.rotation.set(-Math.PI / 2, 0, 0);

  tile2.scale.set(0.05, 0.05, 0.05);
  tile2.rotation.set(-Math.PI / 2, 0, 0);
  tile2.position.set(0, 0, 3);

  scene.add(tile);
  scene.add(tile2);

  control.showY = false;
  control2.showY = false;

  control.attach(tile);
  control2.attach(tile2);

  const gizmo = control.getHelper();
  const gizmo2 = control2.getHelper();

  scene.add(gizmo);
  scene.add(gizmo2);

  let previousMatrix1 = tile.matrix.clone();
  let previousMatrix2 = tile2.matrix.clone();

  function checkCollisionForTile1() {
    const box1 = new THREE.Box3().setFromObject(tile);
    const box2 = new THREE.Box3().setFromObject(tile2);
    if (box1.intersectsBox(box2)) {
      tile.matrix.copy(previousMatrix1);
      tile.matrix.decompose(tile.position, tile.quaternion, tile.scale);
      tile.updateMatrixWorld();
    } else {
      previousMatrix1 = tile.matrix.clone();
    }
    render();
  }

  function checkCollisionForTile2() {
    const box1 = new THREE.Box3().setFromObject(tile);
    const box2 = new THREE.Box3().setFromObject(tile2);
    if (box1.intersectsBox(box2)) {
      tile2.matrix.copy(previousMatrix2);
      tile2.matrix.decompose(tile2.position, tile2.quaternion, tile2.scale);
      tile2.updateMatrixWorld();
    } else {
      previousMatrix2 = tile2.matrix.clone();
    }
    render();
  }
  control.addEventListener("objectChange", checkCollisionForTile1);
  control2.addEventListener("objectChange", checkCollisionForTile2);

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
