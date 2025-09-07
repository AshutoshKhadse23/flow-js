import * as THREE from "three";

/**
 * Scene Manager - handles scene creation and management
 */
export class SceneManager {
    constructor(options = {}) {
        this.scene = new THREE.Scene();
        this.setupScene(options);
    }

    setupScene(options = {}) {
        const { background = null, environment = null, fog = null } = options;

        if (background) this.scene.background = background;
        if (environment) this.scene.environment = environment;
        if (fog) this.scene.fog = fog;
    }

    addObject(object) {
        this.scene.add(object);
    }

    removeObject(object) {
        this.scene.remove(object);
    }

    getScene() {
        return this.scene;
    }

    setBackground(texture) {
        this.scene.background = texture;
    }

    setEnvironment(texture) {
        this.scene.environment = texture;
    }

    setFog(fog) {
        this.scene.fog = fog;
    }

    dispose() {
        // Clean up scene resources
        this.scene.traverse((object) => {
            if (object.geometry) {
                object.geometry.dispose();
            }
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach((material) => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
    }
}

/**
 * Create scene helper function
 */
export function createScene(options = {}) {
    return new SceneManager(options);
}
