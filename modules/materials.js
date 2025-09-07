import * as THREE from "three";

/**
 * Material utilities and presets
 */
export class MaterialManager {
    constructor() {
        this.materials = new Map();
    }

    /**
     * Create a basic material
     */
    createBasicMaterial(options = {}) {
        const material = new THREE.MeshBasicMaterial(options);
        return material;
    }

    /**
     * Create a standard material
     */
    createStandardMaterial(options = {}) {
        const material = new THREE.MeshStandardMaterial(options);
        return material;
    }

    /**
     * Create a physical material
     */
    createPhysicalMaterial(options = {}) {
        const material = new THREE.MeshPhysicalMaterial(options);
        return material;
    }

    /**
     * Create a Lambert material
     */
    createLambertMaterial(options = {}) {
        const material = new THREE.MeshLambertMaterial(options);
        return material;
    }

    /**
     * Create a Phong material
     */
    createPhongMaterial(options = {}) {
        const material = new THREE.MeshPhongMaterial(options);
        return material;
    }

    /**
     * Store a material with a key
     */
    addMaterial(key, material) {
        this.materials.set(key, material);
    }

    /**
     * Get a stored material
     */
    getMaterial(key) {
        return this.materials.get(key);
    }

    /**
     * Remove a material
     */
    removeMaterial(key) {
        const material = this.materials.get(key);
        if (material) {
            material.dispose();
        }
        this.materials.delete(key);
    }

    /**
     * Clone a material
     */
    cloneMaterial(key, newKey) {
        const material = this.getMaterial(key);
        if (!material) return null;

        const clonedMaterial = material.clone();
        this.addMaterial(newKey, clonedMaterial);
        return clonedMaterial;
    }

    /**
     * Update material properties
     */
    updateMaterial(key, properties) {
        const material = this.getMaterial(key);
        if (!material) return null;

        Object.assign(material, properties);
        material.needsUpdate = true;
        return material;
    }

    /**
     * Dispose of all materials
     */
    dispose() {
        for (const [key] of this.materials) {
            this.removeMaterial(key);
        }
    }
}

/**
 * Common material presets
 */
export const MaterialPresets = {
    glass: {
        transparent: true,
        opacity: 0.3,
        roughness: 0,
        metalness: 0,
        transmission: 1,
    },

    metal: {
        roughness: 0.1,
        metalness: 1,
    },

    plastic: {
        roughness: 0.5,
        metalness: 0,
    },

    wood: {
        roughness: 0.8,
        metalness: 0,
    },

    rubber: {
        roughness: 0.9,
        metalness: 0,
    },
};

/**
 * Create material with preset
 */
export function createMaterialWithPreset(preset, additionalOptions = {}) {
    const presetOptions = MaterialPresets[preset] || {};
    const options = { ...presetOptions, ...additionalOptions };
    return new THREE.MeshStandardMaterial(options);
}
