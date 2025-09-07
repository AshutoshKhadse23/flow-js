import * as THREE from "three";

/**
 * Environment utilities for skyboxes, HDRI, and environmental effects
 */
export class EnvironmentManager {
    constructor() {
        this.environments = new Map();
        this.currentEnvironment = null;
    }

    /**
     * Create a basic skybox from texture
     */
    createSkybox(texture) {
        const geometry = new THREE.SphereGeometry(500, 60, 40);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide,
        });

        const skybox = new THREE.Mesh(geometry, material);
        return skybox;
    }

    /**
     * Create a cube skybox
     */
    createCubeSkybox(textures) {
        const loader = new THREE.CubeTextureLoader();
        const cubeTexture = loader.load(textures);
        return cubeTexture;
    }

    /**
     * Set HDRI environment
     */
    setHDRIEnvironment(scene, texture, options = {}) {
        const {
            mapping = THREE.EquirectangularReflectionMapping,
            setAsBackground = true,
            setAsEnvironment = true,
        } = options;

        texture.mapping = mapping;

        if (setAsEnvironment) {
            scene.environment = texture;
        }

        if (setAsBackground) {
            scene.background = texture;
        }

        this.currentEnvironment = {
            type: 'hdri',
            texture,
            options,
        };
    }

    /**
     * Create fog
     */
    createFog(color = 0xcccccc, near = 10, far = 100) {
        return new THREE.Fog(color, near, far);
    }

    /**
     * Create fog with exponential falloff
     */
    createFogExp2(color = 0xcccccc, density = 0.002) {
        return new THREE.FogExp2(color, density);
    }

    /**
     * Add environment to manager
     */
    addEnvironment(key, environment) {
        this.environments.set(key, environment);
    }

    /**
     * Get environment by key
     */
    getEnvironment(key) {
        return this.environments.get(key);
    }

    /**
     * Remove environment
     */
    removeEnvironment(key) {
        const environment = this.environments.get(key);
        if (environment && environment.dispose) {
            environment.dispose();
        }
        this.environments.delete(key);
    }

    /**
     * Switch environment
     */
    switchEnvironment(scene, key) {
        const environment = this.getEnvironment(key);
        if (!environment) {
            console.warn(`Environment "${key}" not found`);
            return;
        }

        // Apply environment based on type
        if (environment.type === 'hdri') {
            this.setHDRIEnvironment(scene, environment.texture, environment.options);
        } else if (environment.type === 'skybox') {
            scene.background = environment.texture;
        }

        this.currentEnvironment = environment;
    }

    /**
     * Get current environment
     */
    getCurrentEnvironment() {
        return this.currentEnvironment;
    }

    /**
     * Dispose of all environments
     */
    dispose() {
        for (const [key] of this.environments) {
            this.removeEnvironment(key);
        }
        this.currentEnvironment = null;
    }
}

/**
 * Environment presets
 */
export const EnvironmentPresets = {
    /**
     * Clear sky preset
     */
    clearSky: {
        fog: { type: 'linear', color: 0x87ceeb, near: 50, far: 200 },
        backgroundColor: 0x87ceeb,
    },

    /**
     * Foggy forest preset
     */
    foggyForest: {
        fog: { type: 'exp2', color: 0x888888, density: 0.01 },
        backgroundColor: 0x888888,
    },

    /**
     * Desert preset
     */
    desert: {
        fog: { type: 'linear', color: 0xffeaa7, near: 100, far: 300 },
        backgroundColor: 0xffeaa7,
    },

    /**
     * Ocean preset
     */
    ocean: {
        fog: { type: 'linear', color: 0x006994, near: 30, far: 150 },
        backgroundColor: 0x006994,
    },
};

/**
 * Apply environment preset
 */
export function applyEnvironmentPreset(scene, preset, environmentManager) {
    const presetConfig = EnvironmentPresets[preset];
    if (!presetConfig) {
        console.warn(`Environment preset "${preset}" not found`);
        return;
    }

    // Set background color
    if (presetConfig.backgroundColor) {
        scene.background = new THREE.Color(presetConfig.backgroundColor);
    }

    // Set fog
    if (presetConfig.fog) {
        const { type, color, near, far, density } = presetConfig.fog;

        if (type === 'linear') {
            scene.fog = environmentManager.createFog(color, near, far);
        } else if (type === 'exp2') {
            scene.fog = environmentManager.createFogExp2(color, density);
        }
    }
}
