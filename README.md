# FlowJS - Three.js Scene Management Library

FlowJS is a comprehensive Three.js scene management library that provides a clean, modular architecture for building 3D web applications.

## 📁 Library Structure

```
/your-library
├── core/
│   ├── loader.js           # Asset loading utilities
│   ├── sceneManager.js     # Scene creation and management
│   ├── renderer.js         # Renderer configuration
│   └── resourceManager.js  # Resource cleanup and management
├── modules/
│   ├── models.js          # 3D model utilities
│   ├── materials.js       # Material creation and presets
│   ├── lighting.js        # Lighting systems and presets
│   ├── environment.js     # Environment and HDRI management
│   └── camera.js          # Camera controls and presets
├── utils/
│   ├── config.js          # Configuration management
│   ├── logger.js          # Logging utilities
│   ├── validator.js       # Input validation
│   └── helpers.js         # General utilities
├── examples/
│   └── basicScene.js      # Example implementations
├── index.js               # Main entry point
└── package.json           # Package configuration
```

## 🚀 Quick Start

### Basic Usage

```javascript
import FlowJS from 'flowjs';

// Create a new scene
const scene = new FlowJS({
  renderer: {
    antialias: true,
    toneMapping: 'ACESFilmic',
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

// Load assets
await scene.loadHDRI('/path/to/environment.hdr');
await scene.loadModel('/path/to/model.glb');

// Add lighting
scene.addLight('sun', {
  type: 'directional',
  color: 0xffffff,
  intensity: 1,
  position: [10, 10, 5],
});

// Start rendering
scene.start();
```

### Using Presets

```javascript
// Apply lighting presets
scene.applyLightingPreset('daylight');
scene.applyLightingPreset('studio');

// Create materials with presets
const glassMaterial = scene.createMaterialWithPreset('glass', {
  color: 0x88ccff,
});

// Apply environment presets
scene.applyEnvironmentPreset('foggyForest');
```

## 📖 API Documentation

### Core Classes

#### FlowJS (Main Class)
The main entry point for creating and managing 3D scenes.

```javascript
const scene = new FlowJS(options);
```

**Methods:**
- `loadModel(url, options)` - Load 3D models
- `loadHDRI(url, options)` - Load HDRI environments
- `addLight(key, options)` - Add lights to scene
- `createMaterial(type, options)` - Create materials
- `start()` - Start animation loop
- `stop()` - Stop animation loop
- `dispose()` - Clean up resources

#### SceneManager
Manages Three.js scene objects and hierarchy.

#### Renderer
Handles WebGL renderer configuration and management.

#### ResourceManager
Manages resource cleanup and memory optimization.

### Modules

#### Models Module
```javascript
import { ModelManager, createAnimationMixer } from 'flowjs/modules/models';
```

#### Materials Module
```javascript
import { MaterialManager, MaterialPresets } from 'flowjs/modules/materials';
```

#### Lighting Module
```javascript
import { LightingManager, LightingPresets } from 'flowjs/modules/lighting';
```

#### Environment Module
```javascript
import { EnvironmentManager, EnvironmentPresets } from 'flowjs/modules/environment';
```

#### Camera Module
```javascript
import { CameraManager, createOrbitControls } from 'flowjs/modules/camera';
```

### Utilities

#### Configuration
```javascript
import { Config, updateConfig } from 'flowjs/utils/config';

updateConfig({
  renderer: { antialias: false },
  debug: { showStats: true },
});
```

#### Logging
```javascript
import { logger } from 'flowjs/utils/logger';

logger.info('Scene loaded');
logger.warn('Performance warning');
logger.error('Loading failed');
```

#### Validation
```javascript
import { Validator } from 'flowjs/utils/validator';

const errors = Validator.validateCameraOptions(options);
```

#### Helpers
```javascript
import { Helpers } from 'flowjs/utils/helpers';

// Utility functions
const randomValue = Helpers.random(0, 100);
const clampedValue = Helpers.clamp(value, 0, 1);
```

## 🎯 Examples

### Basic Scene
```javascript
import { createBasicScene } from 'flowjs/examples/basicScene';

createBasicScene({
  containerId: 'scene-container',
  modelUrl: '/models/car.glb',
  hdriUrl: '/textures/studio.hdr',
  onLoad: (scene) => console.log('Scene ready!'),
});
```

### Advanced Usage
```javascript
import FlowJS, { 
  MaterialPresets, 
  LightingPresets,
  Helpers 
} from 'flowjs';

const scene = new FlowJS();

// Load model with custom processing
const model = await scene.loadModel('/model.glb');
scene.centerObject(model);
scene.scaleToFit(model, 5);

// Create custom materials
const customMaterial = scene.createMaterial('standard', {
  color: 0xff6600,
  roughness: 0.2,
  metalness: 0.8,
});

// Apply to model
model.traverse((child) => {
  if (child.isMesh) {
    child.material = customMaterial;
  }
});
```

## 🔧 Configuration

FlowJS uses a centralized configuration system:

```javascript
import { Config } from 'flowjs/utils/config';

// Default configuration
Config.renderer.antialias = true;
Config.camera.fov = 75;
Config.debug.showStats = false;
```

## 🛠️ Development

### Project Structure
The library follows a modular architecture with clear separation of concerns:

- **Core**: Essential functionality for scene management
- **Modules**: Feature-specific functionality (models, materials, etc.)
- **Utils**: Helper utilities and configuration
- **Examples**: Usage examples and templates

### Building
```bash
npm run build
```

### Development
```bash
npm run dev
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.

## Why Flow.js?

WebGL and Three.js are powerful, but verbose, low-level, and intimidating to newcomers. Flow.js removes the boilerplate, letting you focus on your **scene**, not the scaffolding.

Use simple config-based or declarative patterns to:
- Set up 3D scenes
- Load models
- Add lights, cameras, and interactions
- Animate objects
- Compose complex scenes from reusable components

## Documentation

See the full documentation for this library [here](https://google.com).

## Installation

To install you need to have a JavaScript runtime installed on your system:

1. **For Node.js:**
   ```bash
   npm install flowjs3d

2. **For Bun:**
   ```bash
   bun install flowjs3d
