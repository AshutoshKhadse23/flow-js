import * as THREE from "three";
import { createRenderer } from "./utils/createRenderer";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();

// Create a default camera (will be overwritten if Blender camera is found)
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1.5, 4);

// Renderer
// const renderer = new THREE.WebGLRenderer({ antialias: true });
// renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.outputEncoding = THREE.sRGBEncoding;
// renderer.toneMapping = THREE.ACESFilmicToneMapping;
// renderer.toneMappingExposure = 1.2;
// document.body.appendChild(renderer.domElement);
const renderer = createRenderer();

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);
controls.update();

// HDRI Loader
const rgbeLoader = new RGBELoader();
rgbeLoader.load("/hdri.hdr", function (texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
  scene.background = texture;

  // Load GLB model
  const loader = new GLTFLoader();
  loader.load("/jet.glb", function (gltf) {
    const model = gltf.scene;
    model.scale.set(0.5, 0.5, 0.5); // 🔽 Scale it down uniformly
    scene.add(model);

    // 🔍 Find and use the Blender camera
    let importedCamera = null;
    gltf.scene.traverse((child) => {
      if (child.isCamera) {
        importedCamera = child;
      }
    });

    if (importedCamera) {
      // Copy all camera parameters
      camera.copy(importedCamera);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    } else {
      console.warn("No camera found in glb file, using default camera.");
    }

    animate();
  });
});

// Animate
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

// Handle resizing
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
