import * as THREE from "three";

/**
 * Model utilities for handling 3D models
 */
export class ModelManager {
    constructor() {
        this.models = new Map();
    }

    /**
     * Add a model to the manager
     */
    addModel(key, model) {
        this.models.set(key, model);
    }

    /**
     * Get a model by key
     */
    getModel(key) {
        return this.models.get(key);
    }

    /**
     * Remove a model
     */
    removeModel(key) {
        const model = this.models.get(key);
        if (model) {
            // Dispose of model resources
            model.traverse((child) => {
                if (child.geometry) {
                    child.geometry.dispose();
                }
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach((material) => material.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        }
        this.models.delete(key);
    }

    /**
     * Get all models
     */
    getAllModels() {
        return Array.from(this.models.values());
    }

    /**
     * Transform a model
     */
    transformModel(key, transformOptions = {}) {
        const model = this.getModel(key);
        if (!model) return null;

        const { position, rotation, scale } = transformOptions;

        if (position) model.position.set(...position);
        if (rotation) model.rotation.set(...rotation);
        if (scale) model.scale.set(...scale);

        return model;
    }

    /**
     * Clone a model
     */
    cloneModel(key, newKey) {
        const model = this.getModel(key);
        if (!model) return null;

        const clonedModel = model.clone();
        this.addModel(newKey, clonedModel);
        return clonedModel;
    }

    /**
     * Dispose of all models
     */
    dispose() {
        for (const [key] of this.models) {
            this.removeModel(key);
        }
    }
}

/**
 * Animation mixer helper for models
 */
export function createAnimationMixer(model, animations, options = {}) {
    const {
        autoPlay = true,
        playAll = false,
        animationIndex = 0,
        timeScale = 1,
    } = options;

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
