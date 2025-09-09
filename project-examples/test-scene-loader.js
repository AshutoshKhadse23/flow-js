// FlowJS Test Scene Loader - Using only FlowJS library
import { SceneManager } from '../library/core/sceneManager.js';
import { Renderer } from '../library/core/renderer.js';
import { loadGLTF, loadHDRI } from '../library/core/loader.js';
import { CameraManager, createOrbitControls } from '../library/modules/camera.js';
// import { LightingManager } from '../library/modules/lighting.js';

async function loadTestScene() {
    try {
        // Scene using FlowJS SceneManager
        const sceneManager = new SceneManager();
        const scene = sceneManager.getScene();

        // Renderer using FlowJS Renderer
        const renderer = new Renderer();
        document.body.appendChild(renderer.getRenderer().domElement);

        // Camera using FlowJS CameraManager
        const cameraManager = new CameraManager();
        const camera = cameraManager.createPerspectiveCamera({
            fov: 75,
            aspect: window.innerWidth / window.innerHeight,
            near: 0.1,
            far: 1000,
            position: [0, 2, 8]
        });

        // Controls using FlowJS camera module
        const controls = createOrbitControls(camera, renderer.getRenderer(), {
            enableDamping: true,
            dampingFactor: 0.05
        });

        // Lighting using FlowJS LightingManager
        // const lightingManager = new LightingManager();
        // scene.add(lightingManager.createAmbientLight(0x404040, 0.6));
        // scene.add(lightingManager.createDirectionalLight(0xffffff, 0.8, [10, 10, 5]));

        // Load HDRI using FlowJS Loader
        await loadHDRI('/hdri.hdr', scene);

        // Load Model using FlowJS Loader
        const { model } = await loadGLTF('/jet.glb');
        scene.add(model);

        // Resize handling
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }
        animate();

        // Hide loading
        document.getElementById('loading').style.display = 'none';

    } catch (error) {
        console.error('Scene loading failed:', error);
        const loading = document.getElementById('loading');
        if (loading) {
            loading.textContent = 'Error: ' + error.message;
            loading.style.color = '#ff4444';
        }
    }
}

document.addEventListener('DOMContentLoaded', loadTestScene);
export { loadTestScene };
