import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// 1. Renderer abstraction
export function createRenderer({
  width = window.innerWidth,
  height = window.innerHeight,
  antialias = true,
  toneMapping = THREE.ACESFilmicToneMapping,
  toneMappingExposure = 1.2,
  outputEncoding = THREE.sRGBEncoding,
  appendTo = document.body,
} = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias });
  renderer.setSize(width, height);
  renderer.outputEncoding = outputEncoding;
  renderer.toneMapping = toneMapping;
  renderer.toneMappingExposure = toneMappingExposure;

  appendTo.appendChild(renderer.domElement);
  return renderer;
}

// 2. HDRI Loader abstraction
export function loadHDRI(url, scene, {
  mapping = THREE.EquirectangularReflectionMapping,
  setAsBackground = true,
  setAsEnvironment = true,
  onLoad = null,
  onError = null,
} = {}) {
  const rgbeLoader = new RGBELoader();

  return new Promise((resolve, reject) => {
    rgbeLoader.load(
      url,
      function (texture) {
        texture.mapping = mapping;

        if (setAsEnvironment) {
          scene.environment = texture;
        }

        if (setAsBackground) {
          scene.background = texture;
        }

        if (onLoad) onLoad(texture);
        resolve(texture);
      },
      undefined,
      function (error) {
        if (onError) onError(error);
        reject(error);
      }
    );
  });
}

// 3. Camera creation with fallback
export function createCamera({
  fov = 60,
  aspect = window.innerWidth / window.innerHeight,
  near = 0.1,
  far = 1000,
  position = [0, 1.5, 4],
} = {}) {
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(...position);
  return camera;
}

// 4. GLB/GLTF Loader abstraction
export function loadGLTF(url, {
  scale = [1, 1, 1],
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  useCameraFromFile = true,
  onLoad = null,
  onProgress = null,
  onError = null,
} = {}) {
  const loader = new GLTFLoader();

  return new Promise((resolve, reject) => {
    loader.load(
      url,
      function (gltf) {
        const model = gltf.scene;

        // Apply transformations
        model.scale.set(...scale);
        model.position.set(...position);
        model.rotation.set(...rotation);

        // Find camera in the model
        let importedCamera = null;
        if (useCameraFromFile) {
          gltf.scene.traverse((child) => {
            if (child.isCamera) {
              importedCamera = child;
            }
          });
        }

        // Find animations
        const animations = gltf.animations || [];

        const result = {
          model,
          gltf,
          camera: importedCamera,
          animations,
          scene: gltf.scene,
        };

        if (onLoad) onLoad(result);
        resolve(result);
      },
      onProgress,
      function (error) {
        if (onError) onError(error);
        reject(error);
      }
    );
  });
}

// 5. Animation mixer helper
export function createAnimationMixer(model, animations, {
  autoPlay = true,
  playAll = false,
  animationIndex = 0,
  timeScale = 1,
} = {}) {
  if (!animations || animations.length === 0) {
    console.warn("No animations found in the model");
    return null;
  }

  const mixer = new THREE.AnimationMixer(model);
  const actions = [];

  if (playAll) {
    animations.forEach((clip) => {
      const action = mixer.clipAction(clip);
      action.timeScale = timeScale;
      actions.push(action);
      if (autoPlay) action.play();
    });
  } else if (animations[animationIndex]) {
    const action = mixer.clipAction(animations[animationIndex]);
    action.timeScale = timeScale;
    actions.push(action);
    if (autoPlay) action.play();
  }

  return {
    mixer,
    actions,
    update: (deltaTime) => mixer.update(deltaTime),
    play: (index = 0) => actions[index]?.play(),
    pause: (index = 0) => {
      if (actions[index]) actions[index].paused = true;
    },
    resume: (index = 0) => {
      if (actions[index]) actions[index].paused = false;
    },
    stop: (index = 0) => actions[index]?.stop(),
  };
}

// 6. Orbit Controls abstraction
export function createOrbitControls(camera, renderer, {
  target = [0, 1, 0],
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
} = {}) {
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

// 7. Scene setup helper
export function createScene({
  background = null,
  environment = null,
  fog = null,
} = {}) {
  const scene = new THREE.Scene();

  if (background) scene.background = background;
  if (environment) scene.environment = environment;
  if (fog) scene.fog = fog;

  return scene;
}

// 8. Animation loop helper
export function createAnimationLoop(renderer, scene, camera, {
  controls = null,
  animationMixer = null,
  onBeforeRender = null,
  onAfterRender = null,
} = {}) {
  const clock = new THREE.Clock();
  let animationId;

  function animate() {
    animationId = requestAnimationFrame(animate);

    const deltaTime = clock.getDelta();

    if (onBeforeRender) onBeforeRender(deltaTime);

    if (controls && controls.enableDamping) {
      controls.update();
    }

    if (animationMixer) {
      animationMixer.update(deltaTime);
    }

    renderer.render(scene, camera);

    if (onAfterRender) onAfterRender(deltaTime);
  }

  return {
    start: () => {
      animate();
    },
    stop: () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    },
  };
}

// 9. Resize handler
export function setupResizeHandler(camera, renderer) {
  const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize);
  };
}

// 10. All-in-one scene builder
export async function createThreeScene({
  // Renderer options
  renderer: rendererOptions = {},

  // Camera options
  camera: cameraOptions = {},

  // HDRI options
  hdri: hdriOptions = null,

  // Model options
  model: modelOptions = null,

  // Controls options
  controls: controlsOptions = {},

  // Animation options
  animation: animationOptions = {},

  // Scene options
  scene: sceneOptions = {},

  // Callbacks
  onLoad = null,
  onError = null,
} = {}) {
  try {
    // Create basic components
    const scene = createScene(sceneOptions);
    const camera = createCamera(cameraOptions);
    const renderer = createRenderer(rendererOptions);
    const controls = createOrbitControls(camera, renderer, controlsOptions);

    // Setup resize handler
    const removeResizeHandler = setupResizeHandler(camera, renderer);

    let animationMixer = null;
    let animationLoop = null;

    // Load HDRI if provided
    if (hdriOptions && hdriOptions.url) {
      await loadHDRI(hdriOptions.url, scene, hdriOptions);
    }

    // Load model if provided
    if (modelOptions && modelOptions.url) {
      const modelResult = await loadGLTF(modelOptions.url, modelOptions);
      scene.add(modelResult.model);

      // Use camera from file if available and requested
      if (modelResult.camera && modelOptions.useCameraFromFile !== false) {
        camera.copy(modelResult.camera);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
      }

      // Setup animations if available
      if (modelResult.animations.length > 0) {
        animationMixer = createAnimationMixer(
          modelResult.model,
          modelResult.animations,
          animationOptions
        );
      }
    }

    // Create animation loop
    animationLoop = createAnimationLoop(renderer, scene, camera, {
      controls,
      animationMixer,
      ...animationOptions,
    });

    const result = {
      scene,
      camera,
      renderer,
      controls,
      animationMixer,
      animationLoop,
      cleanup: () => {
        animationLoop.stop();
        removeResizeHandler();
      },
    };

    if (onLoad) onLoad(result);
    return result;

  } catch (error) {
    if (onError) onError(error);
    throw error;
  }
}