# FlowJS Project Examples

This folder contains practical examples of how to use the FlowJS modular library.

## 🛩️ Jet Default Example

### Files:
- `jet-default-example.js` - Main example using FlowJS library
- `jet-example.html` - HTML page to run the example

### What it demonstrates:
- Loading a 3D model (jet.glb) with all default parameters
- Setting up HDRI environment for realistic lighting
- Using the modular FlowJS library structure
- Default camera positioning and controls
- Automatic lighting setup with presets

### Default Parameters Used:

#### Renderer:
```javascript
{
  antialias: true,
  toneMapping: 'ACESFilmic',
  toneMappingExposure: 1.2,
}
```

#### Camera:
```javascript
{
  fov: 75,
  position: [0, 2, 8],
  near: 0.1,
  far: 1000,
}
```

#### Controls:
```javascript
{
  enableDamping: true,
  dampingFactor: 0.05,
  autoRotate: false,
  enableZoom: true,
  enableRotate: true,
  enablePan: true,
}
```

#### Model Loading:
```javascript
{
  scale: [1, 1, 1],           // No scaling
  position: [0, 0, 0],        // Centered
  rotation: [0, 0, 0],        // No rotation
  useCameraFromFile: true,    // Use GLB camera if available
}
```

### How to Run:

1. **Development Server:**
   ```bash
   npm run dev
   ```

2. **Navigate to:**
   ```
   http://localhost:5174/project-examples/jet-example.html
   ```

3. **Or use in your own project:**
   ```javascript
   import { loadJetExample } from './project-examples/jet-default-example.js';
   
   const jetScene = await loadJetExample();
   ```

### Features:
- ✅ Automatic HDRI loading
- ✅ Default lighting setup
- ✅ Responsive resize handling
- ✅ Smooth camera controls
- ✅ Console logging for debugging
- ✅ Error handling
- ✅ Cleanup methods
- ✅ Helper utilities

### Library Structure Used:
```
library/
├── core/           # Scene, renderer, loaders
├── modules/        # Models, lighting, materials
├── utils/          # Helpers, config, validation
└── index.js        # Main FlowJS class
```

### Console Output:
The example provides detailed console logging:
- 🚀 Starting message
- 📦 HDRI loading progress
- 🛩️ Model loading progress
- 💡 Lighting setup
- ✅ Success confirmations
- ❌ Error messages if something fails

This example demonstrates the power and simplicity of the FlowJS modular library structure!
