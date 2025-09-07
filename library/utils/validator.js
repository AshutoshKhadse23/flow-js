import * as THREE from "three";

/**
 * Validation utilities for the FlowJS library
 */
export class Validator {
  /**
   * Validate camera options
   */
  static validateCameraOptions(options) {
    const errors = [];

    if (options.fov !== undefined) {
      if (typeof options.fov !== 'number' || options.fov <= 0 || options.fov >= 180) {
        errors.push('Camera fov must be a number between 0 and 180');
      }
    }

    if (options.near !== undefined) {
      if (typeof options.near !== 'number' || options.near <= 0) {
        errors.push('Camera near must be a positive number');
      }
    }

    if (options.far !== undefined) {
      if (typeof options.far !== 'number' || options.far <= 0) {
        errors.push('Camera far must be a positive number');
      }
    }

    if (options.near !== undefined && options.far !== undefined) {
      if (options.near >= options.far) {
        errors.push('Camera near must be less than far');
      }
    }

    if (options.position !== undefined) {
      if (!Array.isArray(options.position) || options.position.length !== 3) {
        errors.push('Camera position must be an array of 3 numbers');
      } else if (!options.position.every(n => typeof n === 'number')) {
        errors.push('Camera position values must be numbers');
      }
    }

    return errors;
  }

  /**
   * Validate renderer options
   */
  static validateRendererOptions(options) {
    const errors = [];

    if (options.width !== undefined) {
      if (typeof options.width !== 'number' || options.width <= 0) {
        errors.push('Renderer width must be a positive number');
      }
    }

    if (options.height !== undefined) {
      if (typeof options.height !== 'number' || options.height <= 0) {
        errors.push('Renderer height must be a positive number');
      }
    }

    if (options.antialias !== undefined) {
      if (typeof options.antialias !== 'boolean') {
        errors.push('Renderer antialias must be a boolean');
      }
    }

    if (options.toneMappingExposure !== undefined) {
      if (typeof options.toneMappingExposure !== 'number' || options.toneMappingExposure <= 0) {
        errors.push('Renderer toneMappingExposure must be a positive number');
      }
    }

    return errors;
  }

  /**
   * Validate model options
   */
  static validateModelOptions(options) {
    const errors = [];

    if (options.scale !== undefined) {
      if (!Array.isArray(options.scale) || options.scale.length !== 3) {
        errors.push('Model scale must be an array of 3 numbers');
      } else if (!options.scale.every(n => typeof n === 'number' && n > 0)) {
        errors.push('Model scale values must be positive numbers');
      }
    }

    if (options.position !== undefined) {
      if (!Array.isArray(options.position) || options.position.length !== 3) {
        errors.push('Model position must be an array of 3 numbers');
      } else if (!options.position.every(n => typeof n === 'number')) {
        errors.push('Model position values must be numbers');
      }
    }

    if (options.rotation !== undefined) {
      if (!Array.isArray(options.rotation) || options.rotation.length !== 3) {
        errors.push('Model rotation must be an array of 3 numbers');
      } else if (!options.rotation.every(n => typeof n === 'number')) {
        errors.push('Model rotation values must be numbers');
      }
    }

    if (options.url !== undefined) {
      if (typeof options.url !== 'string' || options.url.trim() === '') {
        errors.push('Model url must be a non-empty string');
      }
    }

    return errors;
  }

  /**
   * Validate lighting options
   */
  static validateLightingOptions(options) {
    const errors = [];

    if (options.color !== undefined) {
      if (typeof options.color !== 'number' && typeof options.color !== 'string') {
        errors.push('Light color must be a number or string');
      }
    }

    if (options.intensity !== undefined) {
      if (typeof options.intensity !== 'number' || options.intensity < 0) {
        errors.push('Light intensity must be a non-negative number');
      }
    }

    if (options.position !== undefined) {
      if (!Array.isArray(options.position) || options.position.length !== 3) {
        errors.push('Light position must be an array of 3 numbers');
      } else if (!options.position.every(n => typeof n === 'number')) {
        errors.push('Light position values must be numbers');
      }
    }

    return errors;
  }

  /**
   * Validate material options
   */
  static validateMaterialOptions(options) {
    const errors = [];

    if (options.color !== undefined) {
      if (typeof options.color !== 'number' && typeof options.color !== 'string') {
        errors.push('Material color must be a number or string');
      }
    }

    if (options.opacity !== undefined) {
      if (typeof options.opacity !== 'number' || options.opacity < 0 || options.opacity > 1) {
        errors.push('Material opacity must be a number between 0 and 1');
      }
    }

    if (options.roughness !== undefined) {
      if (typeof options.roughness !== 'number' || options.roughness < 0 || options.roughness > 1) {
        errors.push('Material roughness must be a number between 0 and 1');
      }
    }

    if (options.metalness !== undefined) {
      if (typeof options.metalness !== 'number' || options.metalness < 0 || options.metalness > 1) {
        errors.push('Material metalness must be a number between 0 and 1');
      }
    }

    return errors;
  }

  /**
   * Validate URL
   */
  static validateURL(url) {
    if (typeof url !== 'string' || url.trim() === '') {
      return false;
    }
    
    try {
      new URL(url);
      return true;
    } catch {
      // Check if it's a relative path
      return /^[./]|^[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+$/.test(url);
    }
  }

  /**
   * Validate Three.js object
   */
  static validateThreeObject(object, expectedType) {
    if (!object) {
      return false;
    }

    switch (expectedType) {
      case 'Scene':
        return object instanceof THREE.Scene;
      case 'Camera':
        return object instanceof THREE.Camera;
      case 'Renderer':
        return object instanceof THREE.WebGLRenderer;
      case 'Material':
        return object instanceof THREE.Material;
      case 'Geometry':
        return object instanceof THREE.BufferGeometry;
      case 'Light':
        return object instanceof THREE.Light;
      case 'Object3D':
        return object instanceof THREE.Object3D;
      default:
        return false;
    }
  }

  /**
   * Validate and sanitize options
   */
  static validateAndSanitize(options, validationRules) {
    const errors = [];
    const sanitized = { ...options };

    Object.entries(validationRules).forEach(([key, rule]) => {
      const value = options[key];
      
      if (value === undefined && rule.required) {
        errors.push(`${key} is required`);
        return;
      }

      if (value !== undefined) {
        // Type validation
        if (rule.type && typeof value !== rule.type) {
          errors.push(`${key} must be of type ${rule.type}`);
          return;
        }

        // Range validation
        if (rule.min !== undefined && value < rule.min) {
          errors.push(`${key} must be >= ${rule.min}`);
          return;
        }

        if (rule.max !== undefined && value > rule.max) {
          errors.push(`${key} must be <= ${rule.max}`);
          return;
        }

        // Array validation
        if (rule.array) {
          if (!Array.isArray(value)) {
            errors.push(`${key} must be an array`);
            return;
          }
          if (rule.array.length && value.length !== rule.array.length) {
            errors.push(`${key} must have ${rule.array.length} elements`);
            return;
          }
        }

        // Custom validation
        if (rule.validate && !rule.validate(value)) {
          errors.push(`${key} failed validation`);
          return;
        }

        // Sanitization
        if (rule.sanitize) {
          sanitized[key] = rule.sanitize(value);
        }
      }
    });

    return { errors, sanitized };
  }
}

/**
 * Common validation rules
 */
export const ValidationRules = {
  position: {
    type: 'object',
    array: { length: 3 },
    validate: (value) => Array.isArray(value) && value.every(n => typeof n === 'number'),
  },
  
  color: {
    validate: (value) => typeof value === 'number' || typeof value === 'string',
  },
  
  intensity: {
    type: 'number',
    min: 0,
  },
  
  url: {
    type: 'string',
    validate: Validator.validateURL,
  },
  
  percentage: {
    type: 'number',
    min: 0,
    max: 1,
  },
};
