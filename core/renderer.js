import * as THREE from "three";

/**
 * Renderer class for managing Three.js renderer
 */
export class Renderer {
    constructor(options = {}) {
        const {
            width = window.innerWidth,
            height = window.innerHeight,
            antialias = true,
            toneMapping = THREE.ACESFilmicToneMapping,
            toneMappingExposure = 1.2,
            outputEncoding = THREE.sRGBEncoding,
            appendTo = document.body,
        } = options;

        this.renderer = new THREE.WebGLRenderer({ antialias });
        this.setupRenderer({ width, height, toneMapping, toneMappingExposure, outputEncoding });

        if (appendTo) {
            appendTo.appendChild(this.renderer.domElement);
        }
    }

    setupRenderer(options) {
        const { width, height, toneMapping, toneMappingExposure, outputEncoding } = options;

        this.renderer.setSize(width, height);
        this.renderer.outputEncoding = outputEncoding;
        this.renderer.toneMapping = toneMapping;
        this.renderer.toneMappingExposure = toneMappingExposure;
    }

    render(scene, camera) {
        this.renderer.render(scene, camera);
    }

    setSize(width, height) {
        this.renderer.setSize(width, height);
    }

    getRenderer() {
        return this.renderer;
    }

    getDomElement() {
        return this.renderer.domElement;
    }

    dispose() {
        this.renderer.dispose();
    }
}

/**
 * Create renderer helper function
 */
export function createRenderer(options = {}) {
    return new Renderer(options);
}
