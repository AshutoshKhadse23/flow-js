import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { WebIO } from '@gltf-transform/core';
import { simplify, weld, quantize, cloneDocument } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';

// GLTF/GLB Loader utility (modified for LOD)
const simplifierReady = MeshoptSimplifier.ready;

// Define default LOD levels. This can be overridden via options.
const DEFAULT_LOD_LEVELS = [
    { ratio: 0.3, distance: 20, error: 0.02 }, // Medium detail
    { ratio: 0.1, distance: 50, error: 0.05 }, // Low detail
];

/**
 * Manages all LOD objects that need updating each frame.
 * The user should call updateManager.update(camera) in their animation loop.
 */
export const updateManager = {
    lods: new Set(),
    add(lod) { this.lods.add(lod); },
    remove(lod) { this.lods.delete(lod); },
    update(camera) {
        for (const lod of this.lods) {
            lod.update(camera);
            console.log("Model updated!!!")
        }
    }
};

/**
 * Loads a GLTF model with advanced options and automated LOD generation.
 */
export async function loadGLTF(url, options = {}) {
    // --- Destructure Options with New LOD parameters ---
    const {
        scale = [1, 1, 1],
        position = [0, 0, 0],
        rotation = [0, 0, 0],
        useCameraFromFile = true,
        lod = false, // The main flag to enable LODs
        lodLevels = DEFAULT_LOD_LEVELS, // Allow custom LOD configs
        onLoad = null,
        onProgress = null,
        onError = null,
    } = options;

    const gltfLoader = new GLTFLoader();

    try {
        let result;

        // --- Path 1: Standard Model Loading (lod: false) ---
        if (!lod) {
            const gltf = await gltfLoader.loadAsync(url, onProgress);
            const model = gltf.scene;

            result = {
                model,
                gltf,
                camera: findCamera(gltf, useCameraFromFile),
                animations: gltf.animations || [],
                scene: gltf.scene,
            };
        }
        // --- Path 2: Automated LOD Generation (lod: true) ---
        else {
            await simplifierReady; // Ensure meshoptimizer is initialized
            const io = new WebIO();
            const fileLoader = new THREE.FileLoader();
            fileLoader.setResponseType('arraybuffer');

            // 1. Fetch and read the original model data
            const originalBuffer = await fileLoader.loadAsync(url, onProgress);
            
            // 2. Generate lower-poly model buffers in memory
            const originalUint8Array = new Uint8Array(originalBuffer);
            const document = await io.readBinary(originalUint8Array);
            const modelBuffers = [originalUint8Array];
            for (const level of lodLevels) {
                const docClone = await cloneDocument(document);
                await docClone.transform(
                    weld(), quantize(),
                    simplify({ simplifier: MeshoptSimplifier, ratio: level.ratio, error: level.error })
                );
                const processedBuffer = await io.writeBinary(docClone);
                modelBuffers.push(processedBuffer); // writeBinary already returns Uint8Array
            }

            // 3. Parse all buffers into Three.js GLTF objects
            // Convert Uint8Array back to ArrayBuffer for GLTFLoader
            const gltfPromises = modelBuffers.map(uint8Array => {
                const arrayBuffer = uint8Array.buffer.slice(
                    uint8Array.byteOffset, 
                    uint8Array.byteOffset + uint8Array.byteLength
                );
                return gltfLoader.parseAsync(arrayBuffer, '');
            });
            const gltfs = await Promise.all(gltfPromises);
            
            // 4. Assemble the THREE.LOD object
            const lodObject = new THREE.LOD();
            const originalGltf = gltfs[0];
            
            lodObject.addLevel(originalGltf.scene, 0);
            gltfs.slice(1).forEach((gltf, index) => {
                lodObject.addLevel(gltf.scene, lodLevels[index].distance);
            });

            // 5. Register for automatic updates and construct the result object
            updateManager.add(lodObject);
            lodObject.userData.dispose = () => updateManager.remove(lodObject);

            result = {
                model: lodObject, // The main object is now the LOD group
                gltf: originalGltf, // The original, high-detail gltf object
                camera: findCamera(originalGltf, useCameraFromFile),
                animations: originalGltf.animations || [],
                scene: lodObject,
            };
        }

        // --- Apply transformations to the final model (standard or LOD) ---
        result.model.scale.set(...scale);
        result.model.position.set(...position);
        result.model.rotation.set(...rotation);

        if (onLoad) onLoad(result);
        return result;

    } catch (error) {
        console.error(`Failed to load model from ${url}:`, error);
        if (onError) onError(error);
        throw error; // Re-throw to reject the promise
    }
}

/**
 * Helper function to find a camera in a GLTF scene.
 * @param {object} gltf - The loaded GLTF object.
 * @param {boolean} useCameraFromFile - Flag to enable/disable camera search.
 * @returns {THREE.Camera | null}
 */
function findCamera(gltf, useCameraFromFile) {
    if (!useCameraFromFile) return null;
    let importedCamera = null;
    gltf.scene.traverse((child) => {
        if (child.isCamera) {
            importedCamera = child;
        }
    });
    return importedCamera;
}


/**
 * GLTF/GLB Loader utility (original)
 */
// export function loadGLTF(url, options = {}) {
//     const {
//         scale = [1, 1, 1],
//         position = [0, 0, 0],
//         rotation = [0, 0, 0],
//         useCameraFromFile = true,
//         onLoad = null,
//         onProgress = null,
//         onError = null,
//     } = options;

//     const loader = new GLTFLoader();

//     return new Promise((resolve, reject) => {
//         loader.load(
//             url,
//             function (gltf) {
//                 const model = gltf.scene;

//                 // Apply transformations
//                 model.scale.set(...scale);
//                 model.position.set(...position);
//                 model.rotation.set(...rotation);

//                 // Find camera in the model
//                 let importedCamera = null;
//                 if (useCameraFromFile) {
//                     gltf.scene.traverse((child) => {
//                         if (child.isCamera) {
//                             importedCamera = child;
//                         }
//                     });
//                 }

//                 // Find animations
//                 const animations = gltf.animations || [];

//                 const result = {
//                     model,
//                     gltf,
//                     camera: importedCamera,
//                     animations,
//                     scene: gltf.scene,
//                 };

//                 if (onLoad) onLoad(result);
//                 resolve(result);
//             },
//             onProgress,
//             function (error) {
//                 if (onError) onError(error);
//                 reject(error);
//             }
//         );
//     });
// }

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
