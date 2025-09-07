import * as THREE from "three";

/**
 * Lighting utilities and presets
 */
export class LightingManager {
    constructor() {
        this.lights = new Map();
    }

    /**
     * Create ambient light
     */
    createAmbientLight(color = 0x404040, intensity = 0.4) {
        const light = new THREE.AmbientLight(color, intensity);
        return light;
    }

    /**
     * Create directional light
     */
    createDirectionalLight(color = 0xffffff, intensity = 1, position = [10, 10, 5]) {
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(...position);
        light.castShadow = true;

        // Configure shadow properties
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 50;

        return light;
    }

    /**
     * Create point light
     */
    createPointLight(color = 0xffffff, intensity = 1, distance = 0, decay = 1, position = [0, 10, 0]) {
        const light = new THREE.PointLight(color, intensity, distance, decay);
        light.position.set(...position);
        light.castShadow = true;
        return light;
    }

    /**
     * Create spot light
     */
    createSpotLight(color = 0xffffff, intensity = 1, distance = 0, angle = Math.PI / 3, penumbra = 0, decay = 1, position = [0, 10, 0]) {
        const light = new THREE.SpotLight(color, intensity, distance, angle, penumbra, decay);
        light.position.set(...position);
        light.castShadow = true;
        return light;
    }

    /**
     * Create hemisphere light
     */
    createHemisphereLight(skyColor = 0xb1e1ff, groundColor = 0xb97a20, intensity = 1) {
        const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        return light;
    }

    /**
     * Create rect area light
     */
    createRectAreaLight(color = 0xffffff, intensity = 1, width = 10, height = 10, position = [0, 10, 0]) {
        const light = new THREE.RectAreaLight(color, intensity, width, height);
        light.position.set(...position);
        light.lookAt(0, 0, 0);
        return light;
    }

    /**
     * Add light to manager
     */
    addLight(key, light) {
        this.lights.set(key, light);
    }

    /**
     * Get light by key
     */
    getLight(key) {
        return this.lights.get(key);
    }

    /**
     * Remove light
     */
    removeLight(key) {
        const light = this.lights.get(key);
        if (light) {
            light.dispose && light.dispose();
        }
        this.lights.delete(key);
    }

    /**
     * Update light properties
     */
    updateLight(key, properties) {
        const light = this.getLight(key);
        if (!light) return null;

        Object.assign(light, properties);
        return light;
    }

    /**
     * Dispose of all lights
     */
    dispose() {
        for (const [key] of this.lights) {
            this.removeLight(key);
        }
    }
}

/**
 * Lighting presets
 */
export const LightingPresets = {
    /**
     * Natural daylight setup
     */
    daylight: () => ({
        ambient: { color: 0x404040, intensity: 0.4 },
        directional: { color: 0xffffff, intensity: 1, position: [10, 10, 5] },
    }),

    /**
     * Warm indoor lighting
     */
    indoor: () => ({
        ambient: { color: 0x404040, intensity: 0.6 },
        point: { color: 0xffaa88, intensity: 0.8, position: [0, 8, 0] },
    }),

    /**
     * Studio lighting setup
     */
    studio: () => ({
        ambient: { color: 0x404040, intensity: 0.2 },
        key: { color: 0xffffff, intensity: 1, position: [10, 10, 5] },
        fill: { color: 0x8888ff, intensity: 0.3, position: [-10, 5, 2] },
        rim: { color: 0xffaa88, intensity: 0.5, position: [0, 10, -10] },
    }),

    /**
     * Sunset lighting
     */
    sunset: () => ({
        ambient: { color: 0x332211, intensity: 0.3 },
        directional: { color: 0xff6644, intensity: 0.8, position: [-10, 2, -5] },
        hemisphere: { skyColor: 0xff6644, groundColor: 0x332211, intensity: 0.4 },
    }),
};

/**
 * Apply lighting preset to scene
 */
export function applyLightingPreset(scene, preset, lightingManager) {
    const presetConfig = LightingPresets[preset];
    if (!presetConfig) {
        console.warn(`Lighting preset "${preset}" not found`);
        return;
    }

    const config = presetConfig();

    Object.entries(config).forEach(([lightType, lightConfig]) => {
        let light;

        switch (lightType) {
            case 'ambient':
                light = lightingManager.createAmbientLight(lightConfig.color, lightConfig.intensity);
                break;
            case 'directional':
                light = lightingManager.createDirectionalLight(lightConfig.color, lightConfig.intensity, lightConfig.position);
                break;
            case 'point':
                light = lightingManager.createPointLight(lightConfig.color, lightConfig.intensity, 0, 1, lightConfig.position);
                break;
            case 'hemisphere':
                light = lightingManager.createHemisphereLight(lightConfig.skyColor, lightConfig.groundColor, lightConfig.intensity);
                break;
            case 'key':
            case 'fill':
            case 'rim':
                light = lightingManager.createDirectionalLight(lightConfig.color, lightConfig.intensity, lightConfig.position);
                break;
        }

        if (light) {
            lightingManager.addLight(lightType, light);
            scene.add(light);
        }
    });
}
