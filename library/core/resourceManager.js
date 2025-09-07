import * as THREE from "three";

/**
 * Resource Manager - handles cleanup and resource management
 */
export class ResourceManager {
  constructor() {
    this.resources = new Map();
    this.disposables = [];
  }

  /**
   * Add a resource to be managed
   */
  addResource(key, resource) {
    this.resources.set(key, resource);
  }

  /**
   * Get a managed resource
   */
  getResource(key) {
    return this.resources.get(key);
  }

  /**
   * Remove a resource
   */
  removeResource(key) {
    const resource = this.resources.get(key);
    if (resource && resource.dispose) {
      resource.dispose();
    }
    this.resources.delete(key);
  }

  /**
   * Add a disposable object
   */
  addDisposable(disposable) {
    this.disposables.push(disposable);
  }

  /**
   * Dispose of all managed resources
   */
  dispose() {
    // Dispose of all resources
    for (const [key, resource] of this.resources) {
      if (resource && resource.dispose) {
        resource.dispose();
      }
    }
    this.resources.clear();

    // Dispose of all disposables
    this.disposables.forEach((disposable) => {
      if (disposable && disposable.dispose) {
        disposable.dispose();
      }
    });
    this.disposables = [];
  }

  /**
   * Get memory usage information
   */
  getMemoryUsage() {
    const info = this.renderer?.info;
    if (info) {
      return {
        geometries: info.memory.geometries,
        textures: info.memory.textures,
        programs: info.programs?.length || 0,
      };
    }
    return null;
  }
}
