import { FlowJS } from '../index.js';

/**
 * Basic Scene Example
 * This example demonstrates how to create a simple scene with a model and HDRI environment
 */
export async function createBasicScene(options = {}) {
  const {
    containerId = 'scene-container',
    modelUrl = '/jet.glb',
    hdriUrl = '/hdri.hdr',
    onLoad = null,
    onError = null,
  } = options;

  try {
    // Get container element
    const container = document.getElementById(containerId) || document.body;

    // Create FlowJS instance
    const scene = new FlowJS({
      container,
      renderer: {
        antialias: true,
        toneMapping: 'ACESFilmic',
        toneMappingExposure: 1.2,
      },
      camera: {
        fov: 75,
        position: [0, 2, 8],
      },
      controls: {
        enableDamping: true,
        autoRotate: false,
      },
    });

    // Load HDRI environment
    if (hdriUrl) {
      await scene.loadHDRI(hdriUrl, {
        setAsBackground: true,
        setAsEnvironment: true,
      });
    }

    // Load 3D model
    if (modelUrl) {
      const model = await scene.loadModel(modelUrl, {
        scale: [0.5, 0.5, 0.5],
        useCameraFromFile: true,
      });

      // Center the model
      scene.centerObject(model);
    }

    // Add basic lighting
    scene.addLight('ambient', {
      type: 'ambient',
      color: 0x404040,
      intensity: 0.4,
    });

    scene.addLight('directional', {
      type: 'directional',
      color: 0xffffff,
      intensity: 1,
      position: [10, 10, 5],
      castShadow: true,
    });

    // Start animation loop
    scene.start();

    // Setup resize handling
    scene.setupResize();

    if (onLoad) {
      onLoad(scene);
    }

    return scene;

  } catch (error) {
    console.error('Failed to create basic scene:', error);
    if (onError) {
      onError(error);
    }
    throw error;
  }
}

/**
 * Usage example:
 * 
 * createBasicScene({
 *   containerId: 'my-scene',
 *   modelUrl: '/models/my-model.glb',
 *   hdriUrl: '/textures/environment.hdr',
 *   onLoad: (scene) => {
 *     console.log('Scene loaded successfully!');
 *   },
 *   onError: (error) => {
 *     console.error('Scene loading failed:', error);
 *   }
 * });
 */
