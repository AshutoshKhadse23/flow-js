/**
 * Configuration settings for the FlowJS library
 */
export const Config = {
  // Renderer settings
  renderer: {
    antialias: true,
    toneMapping: 'ACESFilmic', // 'Linear', 'Reinhard', 'Cineon', 'ACESFilmic'
    toneMappingExposure: 1.2,
    outputEncoding: 'sRGB', // 'Linear', 'sRGB'
    shadowMap: {
      enabled: true,
      type: 'PCFSoft', // 'Basic', 'PCF', 'PCFSoft', 'VSM'
    },
  },

  // Camera settings
  camera: {
    fov: 75,
    near: 0.1,
    far: 1000,
    position: [0, 0, 5],
  },

  // Controls settings
  controls: {
    enableDamping: true,
    dampingFactor: 0.05,
    autoRotate: false,
    autoRotateSpeed: 2.0,
  },

  // Lighting settings
  lighting: {
    defaultPreset: 'daylight',
    shadows: true,
  },

  // Animation settings
  animation: {
    autoPlay: true,
    timeScale: 1,
  },

  // Performance settings
  performance: {
    maxFPS: 60,
    adaptiveQuality: true,
    frustumCulling: true,
  },

  // Debug settings
  debug: {
    showStats: false,
    showAxes: false,
    showGrid: false,
    logPerformance: false,
  },
};

/**
 * Update configuration
 */
export function updateConfig(newConfig) {
  Object.assign(Config, newConfig);
}

/**
 * Get configuration value
 */
export function getConfig(path) {
  return path.split('.').reduce((obj, key) => obj?.[key], Config);
}

/**
 * Set configuration value
 */
export function setConfig(path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((obj, key) => {
    if (!obj[key]) obj[key] = {};
    return obj[key];
  }, Config);
  target[lastKey] = value;
}
