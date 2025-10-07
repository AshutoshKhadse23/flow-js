import { SceneManager } from '../library/core/sceneManager.js';
import { Renderer } from '../library/core/renderer.js';
import { loadGLTF, loadHDRI, updateManager } from '../library/core/loader.js';
import { CameraManager, createOrbitControls } from '../library/modules/camera.js';

async function loadTestScene() {
    const sceneManager = new SceneManager();
    const scene = sceneManager.getScene();

    const renderer = new Renderer();
    document.body.appendChild(renderer.getRenderer().domElement);

    const cameraManager = new CameraManager();
    const camera = cameraManager.createPerspectiveCamera({
        fov: 75,
        aspect: window.innerWidth / window.innerHeight,
        near: 0.1,
        far: 1000,
        position: [0, 2, 8]
    });

    const controls = createOrbitControls(camera, renderer.getRenderer(), {
        enableDamping: true,
        dampingFactor: 0.05
    });

    await loadHDRI('/hdri.hdr', scene);

    const shipModel = await loadGLTF('./public/ship.glb', {
        lod: true,
        position: [0, 0, 0],
    });
    scene.add(shipModel.model);

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        updateManager.update(camera);
        renderer.render(scene, camera);
    }
    animate();

    document.getElementById('loading').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', loadTestScene);
export { loadTestScene };