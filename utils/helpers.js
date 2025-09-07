import * as THREE from "three";

/**
 * Helper utilities for common Three.js operations
 */
export class Helpers {
    /**
     * Convert degrees to radians
     */
    static degToRad(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Convert radians to degrees
     */
    static radToDeg(radians) {
        return radians * (180 / Math.PI);
    }

    /**
     * Clamp a value between min and max
     */
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * Linear interpolation
     */
    static lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    /**
     * Map a value from one range to another
     */
    static mapRange(value, fromMin, fromMax, toMin, toMax) {
        return ((value - fromMin) / (fromMax - fromMin)) * (toMax - toMin) + toMin;
    }

    /**
     * Generate random number between min and max
     */
    static random(min = 0, max = 1) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Generate random integer between min and max (inclusive)
     */
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Get random element from array
     */
    static randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * Debounce function calls
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function calls
     */
    static throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Deep clone an object
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => Helpers.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = Helpers.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    }

    /**
     * Merge objects deeply
     */
    static mergeDeep(target, ...sources) {
        if (!sources.length) return target;
        const source = sources.shift();

        if (Helpers.isObject(target) && Helpers.isObject(source)) {
            for (const key in source) {
                if (Helpers.isObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    Helpers.mergeDeep(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }

        return Helpers.mergeDeep(target, ...sources);
    }

    /**
     * Check if value is an object
     */
    static isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }

    /**
     * Format file size
     */
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Format time duration
     */
    static formatDuration(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    /**
     * Get device pixel ratio
     */
    static getPixelRatio() {
        return window.devicePixelRatio || 1;
    }

    /**
     * Check if device supports WebGL
     */
    static supportsWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
        } catch (e) {
            return false;
        }
    }

    /**
     * Check if device supports WebGL2
     */
    static supportsWebGL2() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
        } catch (e) {
            return false;
        }
    }

    /**
     * Get GPU information
     */
    static getGPUInfo() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        if (!gl) return null;

        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (!debugInfo) return null;

        return {
            vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
            renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
        };
    }

    /**
     * Create progress tracker
     */
    static createProgressTracker() {
        let total = 0;
        let completed = 0;
        const callbacks = [];

        return {
            setTotal(value) {
                total = value;
            },

            increment() {
                completed++;
                const progress = total > 0 ? completed / total : 0;
                callbacks.forEach(callback => callback(progress, completed, total));
            },

            onProgress(callback) {
                callbacks.push(callback);
            },

            getProgress() {
                return total > 0 ? completed / total : 0;
            },

            reset() {
                total = 0;
                completed = 0;
            }
        };
    }

    /**
     * Create resize handler
     */
    static createResizeHandler(camera, renderer, onResize = null) {
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            if (camera.isPerspectiveCamera) {
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
            } else if (camera.isOrthographicCamera) {
                const aspect = width / height;
                camera.left = -10 * aspect;
                camera.right = 10 * aspect;
                camera.top = 10;
                camera.bottom = -10;
                camera.updateProjectionMatrix();
            }

            renderer.setSize(width, height);

            if (onResize) {
                onResize(width, height);
            }
        };

        // Debounce resize events
        const debouncedResize = Helpers.debounce(handleResize, 100);

        window.addEventListener('resize', debouncedResize);

        return () => {
            window.removeEventListener('resize', debouncedResize);
        };
    }

    /**
     * Calculate bounding box of object
     */
    static getBoundingBox(object) {
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        return {
            box,
            size,
            center,
            min: box.min,
            max: box.max,
        };
    }

    /**
     * Center object at origin
     */
    static centerObject(object) {
        const boundingBox = Helpers.getBoundingBox(object);
        object.position.sub(boundingBox.center);
        return object;
    }

    /**
     * Scale object to fit in size
     */
    static scaleToFit(object, targetSize) {
        const boundingBox = Helpers.getBoundingBox(object);
        const maxDimension = Math.max(boundingBox.size.x, boundingBox.size.y, boundingBox.size.z);
        const scale = targetSize / maxDimension;
        object.scale.multiplyScalar(scale);
        return object;
    }
}
