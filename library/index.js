/**
 * FlowJS - A Three.js Scene Management Library
 * Main entry point that provides a unified API for creating and managing 3D scenes
 */

// Core imports
import { SceneManager } from './core/sceneManager.js';
import { Renderer } from './core/renderer.js';
import { ResourceManager } from './core/resourceManager.js';
import { loadGLTF, loadHDRI, loadTexture } from './core/loader.js';

// Module imports
import { ModelManager, createAnimationMixer } from './modules/models.js';
import { MaterialManager, MaterialPresets, createMaterialWithPreset } from './modules/materials.js';
import { LightingManager, LightingPresets, applyLightingPreset } from './modules/lighting.js';
import { EnvironmentManager, EnvironmentPresets, applyEnvironmentPreset } from './modules/environment.js';
import { CameraManager, createOrbitControls, CameraPresets } from './modules/camera.js';

// Utility imports
import { Config, updateConfig, getConfig, setConfig } from './utils/config.js';
import { Logger, logger, PerformanceLogger, performanceLogger } from './utils/logger.js';
import { Validator, ValidationRules } from './utils/validator.js';
import { Helpers } from './utils/helpers.js';

// Three.js imports
import * as THREE from 'three';

/**
 * Main FlowJS class that provides a unified API for Three.js scene management
 */
export class FlowJS {
  constructor(options = {}) {
    this.options = Helpers.mergeDeep({}, Config, options);
    
    // Initialize managers
    this.sceneManager = new SceneManager(this.options.scene);
    this.renderer = new Renderer(this.options.renderer);
    this.resourceManager = new ResourceManager();
    this.modelManager = new ModelManager();
    this.materialManager = new MaterialManager();
    this.lightingManager = new LightingManager();
    this.environmentManager = new EnvironmentManager();
    this.cameraManager = new CameraManager();
    
    // Create default camera
    const camera = this.cameraManager.createPerspectiveCamera(this.options.camera);
    this.cameraManager.addCamera('default', camera);
    
    // Create controls
    this.controls = createOrbitControls(
      this.cameraManager.getActiveCamera(), 
      this.renderer.getRenderer(), 
      this.options.controls
    );
    
    // Animation loop variables
    this.animationLoop = null;
    this.clock = new THREE.Clock();
    this.animationMixers = [];
    this.isRunning = false;
    
    // Event handlers
    this.resizeHandler = null;
    
    logger.info('FlowJS initialized successfully');
  }

  /**
   * Get the Three.js scene
   */
  getScene() {
    return this.sceneManager.getScene();
  }

  /**
   * Get the active camera
   */
  getCamera() {
    return this.cameraManager.getActiveCamera();
  }

  /**
   * Get the renderer
   */
  getRenderer() {
    return this.renderer.getRenderer();
  }

  /**
   * Load a 3D model
   */
  async loadModel(url, options = {}) {
    const validation = Validator.validateModelOptions(options);
    if (validation.length > 0) {
      throw new Error(`Model validation failed: ${validation.join(', ')}`);
    }

    try {
      logger.info(`Loading model: ${url}`);
      const result = await loadGLTF(url, options);
      
      this.sceneManager.addObject(result.model);
      this.modelManager.addModel(url, result.model);
      
      // Handle animations
      if (result.animations.length > 0) {
        const mixer = createAnimationMixer(result.model, result.animations, this.options.animation);
        if (mixer) {
          this.animationMixers.push(mixer);
        }
      }
      
      // Use camera from file if requested and available
      if (result.camera && options.useCameraFromFile !== false) {
        this.cameraManager.addCamera('imported', result.camera);
        this.cameraManager.setActiveCamera('imported');
      }
      
      logger.info(`Model loaded successfully: ${url}`);
      return result.model;
    } catch (error) {
      logger.error(`Failed to load model: ${url}`, error);
      throw error;
    }
  }

  /**
   * Load HDRI environment
   */
  async loadHDRI(url, options = {}) {
    try {
      logger.info(`Loading HDRI: ${url}`);
      const texture = await loadHDRI(url, this.getScene(), options);
      this.environmentManager.addEnvironment(url, {
        type: 'hdri',
        texture,
        options,
      });
      logger.info(`HDRI loaded successfully: ${url}`);
      return texture;
    } catch (error) {
      logger.error(`Failed to load HDRI: ${url}`, error);
      throw error;
    }
  }

  /**
   * Load texture
   */
  async loadTexture(url, options = {}) {
    try {
      logger.info(`Loading texture: ${url}`);
      const texture = await loadTexture(url, options);
      logger.info(`Texture loaded successfully: ${url}`);
      return texture;
    } catch (error) {
      logger.error(`Failed to load texture: ${url}`, error);
      throw error;
    }
  }

  /**
   * Add light to scene
   */
  addLight(key, options) {
    const validation = Validator.validateLightingOptions(options);
    if (validation.length > 0) {
      throw new Error(`Light validation failed: ${validation.join(', ')}`);
    }

    let light;
    const { type, ...lightOptions } = options;

    switch (type) {
      case 'ambient':
        light = this.lightingManager.createAmbientLight(lightOptions.color, lightOptions.intensity);
        break;
      case 'directional':
        light = this.lightingManager.createDirectionalLight(
          lightOptions.color, 
          lightOptions.intensity, 
          lightOptions.position
        );
        break;
      case 'point':
        light = this.lightingManager.createPointLight(
          lightOptions.color, 
          lightOptions.intensity, 
          lightOptions.distance, 
          lightOptions.decay, 
          lightOptions.position
        );
        break;
      case 'spot':
        light = this.lightingManager.createSpotLight(
          lightOptions.color, 
          lightOptions.intensity, 
          lightOptions.distance, 
          lightOptions.angle, 
          lightOptions.penumbra, 
          lightOptions.decay, 
          lightOptions.position
        );
        break;
      case 'hemisphere':
        light = this.lightingManager.createHemisphereLight(
          lightOptions.skyColor, 
          lightOptions.groundColor, 
          lightOptions.intensity
        );
        break;
      default:
        throw new Error(`Unknown light type: ${type}`);
    }

    this.lightingManager.addLight(key, light);
    this.sceneManager.addObject(light);
    
    logger.info(`Light added: ${key} (${type})`);
    return light;
  }

  /**
   * Apply lighting preset
   */
  applyLightingPreset(preset) {
    applyLightingPreset(this.getScene(), preset, this.lightingManager);
    logger.info(`Applied lighting preset: ${preset}`);
  }

  /**
   * Apply environment preset
   */
  applyEnvironmentPreset(preset) {
    applyEnvironmentPreset(this.getScene(), preset, this.environmentManager);
    logger.info(`Applied environment preset: ${preset}`);
  }

  /**
   * Create material
   */
  createMaterial(type, options = {}) {
    const validation = Validator.validateMaterialOptions(options);
    if (validation.length > 0) {
      throw new Error(`Material validation failed: ${validation.join(', ')}`);
    }

    let material;
    switch (type) {
      case 'basic':
        material = this.materialManager.createBasicMaterial(options);
        break;
      case 'standard':
        material = this.materialManager.createStandardMaterial(options);
        break;
      case 'physical':
        material = this.materialManager.createPhysicalMaterial(options);
        break;
      case 'lambert':
        material = this.materialManager.createLambertMaterial(options);
        break;
      case 'phong':
        material = this.materialManager.createPhongMaterial(options);
        break;
      default:
        throw new Error(`Unknown material type: ${type}`);
    }

    return material;
  }

  /**
   * Create material with preset
   */
  createMaterialWithPreset(preset, options = {}) {
    return createMaterialWithPreset(preset, options);
  }

  /**
   * Add object to scene
   */
  addObject(object) {
    this.sceneManager.addObject(object);
  }

  /**
   * Remove object from scene
   */
  removeObject(object) {
    this.sceneManager.removeObject(object);
  }

  /**
   * Center object at origin
   */
  centerObject(object) {
    return Helpers.centerObject(object);
  }

  /**
   * Scale object to fit in size
   */
  scaleToFit(object, size) {
    return Helpers.scaleToFit(object, size);
  }

  /**
   * Start animation loop
   */
  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    
    const animate = () => {
      if (!this.isRunning) return;

      this.animationLoop = requestAnimationFrame(animate);
      
      const deltaTime = this.clock.getDelta();

      // Update controls
      if (this.controls && this.controls.enableDamping) {
        this.controls.update();
      }

      // Update animation mixers
      this.animationMixers.forEach(mixer => {
        if (mixer && mixer.update) {
          mixer.update(deltaTime);
        }
      });

      // Render scene
      this.renderer.render(this.getScene(), this.getCamera());
    };

    animate();
    logger.info('Animation loop started');
  }

  /**
   * Stop animation loop
   */
  stop() {
    if (this.animationLoop) {
      cancelAnimationFrame(this.animationLoop);
      this.animationLoop = null;
    }
    this.isRunning = false;
    logger.info('Animation loop stopped');
  }

  /**
   * Setup resize handling
   */
  setupResize() {
    if (this.resizeHandler) {
      this.resizeHandler();
    }

    this.resizeHandler = Helpers.createResizeHandler(
      this.getCamera(),
      this.getRenderer()
    );
    
    logger.info('Resize handler setup');
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.options = Helpers.mergeDeep(this.options, newConfig);
    updateConfig(newConfig);
  }

  /**
   * Dispose of all resources
   */
  dispose() {
    // Stop animation loop
    this.stop();

    // Remove resize handler
    if (this.resizeHandler) {
      this.resizeHandler();
    }

    // Dispose of managers
    this.resourceManager.dispose();
    this.modelManager.dispose();
    this.materialManager.dispose();
    this.lightingManager.dispose();
    this.environmentManager.dispose();
    this.cameraManager.dispose();
    this.sceneManager.dispose();
    this.renderer.dispose();

    // Clear animation mixers
    this.animationMixers = [];

    logger.info('FlowJS instance disposed');
  }
}

// Export everything for advanced usage
export {
  // Core
  SceneManager,
  Renderer,
  ResourceManager,
  loadGLTF,
  loadHDRI,
  loadTexture,
  
  // Modules
  ModelManager,
  MaterialManager,
  LightingManager,
  EnvironmentManager,
  CameraManager,
  createAnimationMixer,
  createOrbitControls,
  MaterialPresets,
  LightingPresets,
  EnvironmentPresets,
  CameraPresets,
  createMaterialWithPreset,
  applyLightingPreset,
  applyEnvironmentPreset,
  
  // Utils
  Config,
  updateConfig,
  getConfig,
  setConfig,
  Logger,
  logger,
  PerformanceLogger,
  performanceLogger,
  Validator,
  ValidationRules,
  Helpers,
  
  // Three.js
  THREE,
};

// Default export
export default FlowJS;
