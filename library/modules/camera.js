import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * Camera utilities and management
 */
export class CameraManager {
  constructor() {
    this.cameras = new Map();
    this.activeCamera = null;
  }

  /**
   * Create perspective camera
   */
  createPerspectiveCamera(options = {}) {
    const {
      fov = 75,
      aspect = window.innerWidth / window.innerHeight,
      near = 0.1,
      far = 1000,
      position = [0, 0, 5],
    } = options;

    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(...position);
    return camera;
  }

  /**
   * Create orthographic camera
   */
  createOrthographicCamera(options = {}) {
    const {
      left = -10,
      right = 10,
      top = 10,
      bottom = -10,
      near = 0.1,
      far = 1000,
      position = [0, 0, 5],
    } = options;

    const camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
    camera.position.set(...position);
    return camera;
  }

  /**
   * Add camera to manager
   */
  addCamera(key, camera) {
    this.cameras.set(key, camera);
    if (!this.activeCamera) {
      this.activeCamera = camera;
    }
  }

  /**
   * Get camera by key
   */
  getCamera(key) {
    return this.cameras.get(key);
  }

  /**
   * Set active camera
   */
  setActiveCamera(key) {
    const camera = this.getCamera(key);
    if (camera) {
      this.activeCamera = camera;
      return camera;
    }
    return null;
  }

  /**
   * Get active camera
   */
  getActiveCamera() {
    return this.activeCamera;
  }

  /**
   * Update camera aspect ratio
   */
  updateCameraAspect(key, aspect) {
    const camera = this.getCamera(key);
    if (camera && camera.isPerspectiveCamera) {
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    }
  }

  /**
   * Animate camera to position
   */
  animateCameraTo(camera, targetPosition, targetLookAt, duration = 1000, onComplete = null) {
    const startPosition = camera.position.clone();
    const startLookAt = new THREE.Vector3();
    camera.getWorldDirection(startLookAt);
    startLookAt.add(camera.position);

    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth easing function
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      // Interpolate position
      camera.position.lerpVectors(startPosition, new THREE.Vector3(...targetPosition), easeProgress);
      
      // Interpolate look at
      const currentLookAt = new THREE.Vector3().lerpVectors(startLookAt, new THREE.Vector3(...targetLookAt), easeProgress);
      camera.lookAt(currentLookAt);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else if (onComplete) {
        onComplete();
      }
    };

    animate();
  }

  /**
   * Remove camera
   */
  removeCamera(key) {
    const camera = this.cameras.get(key);
    if (camera === this.activeCamera) {
      this.activeCamera = null;
    }
    this.cameras.delete(key);
  }

  /**
   * Dispose of all cameras
   */
  dispose() {
    this.cameras.clear();
    this.activeCamera = null;
  }
}

/**
 * Create orbit controls
 */
export function createOrbitControls(camera, renderer, options = {}) {
  const {
    target = [0, 0, 0],
    enableDamping = true,
    dampingFactor = 0.05,
    enableZoom = true,
    enableRotate = true,
    enablePan = true,
    minDistance = 0,
    maxDistance = Infinity,
    minPolarAngle = 0,
    maxPolarAngle = Math.PI,
    autoRotate = false,
    autoRotateSpeed = 2.0,
  } = options;

  const controls = new OrbitControls(camera, renderer.domElement);

  controls.target.set(...target);
  controls.enableDamping = enableDamping;
  controls.dampingFactor = dampingFactor;
  controls.enableZoom = enableZoom;
  controls.enableRotate = enableRotate;
  controls.enablePan = enablePan;
  controls.minDistance = minDistance;
  controls.maxDistance = maxDistance;
  controls.minPolarAngle = minPolarAngle;
  controls.maxPolarAngle = maxPolarAngle;
  controls.autoRotate = autoRotate;
  controls.autoRotateSpeed = autoRotateSpeed;

  controls.update();
  return controls;
}

/**
 * Camera presets
 */
export const CameraPresets = {
  /**
   * Default perspective camera
   */
  default: {
    type: 'perspective',
    fov: 75,
    position: [0, 0, 5],
  },

  /**
   * Wide angle camera
   */
  wideAngle: {
    type: 'perspective',
    fov: 120,
    position: [0, 0, 3],
  },

  /**
   * Portrait camera
   */
  portrait: {
    type: 'perspective',
    fov: 50,
    position: [0, 2, 8],
  },

  /**
   * Top-down view
   */
  topDown: {
    type: 'perspective',
    fov: 60,
    position: [0, 20, 0],
    lookAt: [0, 0, 0],
  },

  /**
   * Isometric view
   */
  isometric: {
    type: 'orthographic',
    left: -10,
    right: 10,
    top: 10,
    bottom: -10,
    position: [10, 10, 10],
    lookAt: [0, 0, 0],
  },
};
