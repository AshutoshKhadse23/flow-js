import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

/**
 * GLTF/GLB Loader utility
 */
export function loadGLTF(url, options = {}) {
    const {
        scale = [1, 1, 1],
        position = [0, 0, 0],
        rotation = [0, 0, 0],
        useCameraFromFile = true,
        onLoad = null,
        onProgress = null,
        onError = null,
    } = options;

    const loader = new GLTFLoader();

    return new Promise((resolve, reject) => {
        loader.load(
            url,
            function (gltf) {
                const model = gltf.scene;

                // Apply transformations
                model.scale.set(...scale);
                model.position.set(...position);
                model.rotation.set(...rotation);

                // Find camera in the model
                let importedCamera = null;
                if (useCameraFromFile) {
                    gltf.scene.traverse((child) => {
                        if (child.isCamera) {
                            importedCamera = child;
                        }
                    });
                }

                // Find animations
                const animations = gltf.animations || [];

                const result = {
                    model,
                    gltf,
                    camera: importedCamera,
                    animations,
                    scene: gltf.scene,
                };

                if (onLoad) onLoad(result);
                resolve(result);
            },
            onProgress,
            function (error) {
                if (onError) onError(error);
                reject(error);
            }
        );
    });
}

/**
 * HDRI Loader utility
 */
export function loadHDRI(url, scene, options = {}) {
    const {
        mapping = THREE.EquirectangularReflectionMapping,
        setAsBackground = true,
        setAsEnvironment = true,
        onLoad = null,
        onError = null,
    } = options;

    const rgbeLoader = new RGBELoader();

    return new Promise((resolve, reject) => {
        rgbeLoader.load(
            url,
            function (texture) {
                texture.mapping = mapping;

                if (setAsEnvironment) {
                    scene.environment = texture;
                }

                if (setAsBackground) {
                    scene.background = texture;
                }

                if (onLoad) onLoad(texture);
                resolve(texture);
            },
            undefined,
            function (error) {
                if (onError) onError(error);
                reject(error);
            }
        );
    });
}

/**
 * Texture Loader utility
 */
export function loadTexture(url, options = {}) {
    const { onLoad = null, onError = null } = options;
    const loader = new TextureLoader();

    return new Promise((resolve, reject) => {
        loader.load(
            url,
            function (texture) {
                if (onLoad) onLoad(texture);
                resolve(texture);
            },
            undefined,
            function (error) {
                if (onError) onError(error);
                reject(error);
            }
        );
    });
}
