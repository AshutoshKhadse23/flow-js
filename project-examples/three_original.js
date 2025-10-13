import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

async function loadTestScene() {

    const startTime = performance.now();
    console.time("Scene Load Time");   

    // Scene
    const scene = new THREE.Scene();

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    document.body.appendChild(renderer.domElement);

    // Camera
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, 8);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // HDRI Environment Map
    const hdrLoader = new RGBELoader();
    hdrLoader.load('/hdri.hdr', (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
        scene.background = texture;
    });

    // Load GLTF model (with simulated LOD levels)
    const gltfLoader = new GLTFLoader();

    const loadLODLevel = (level) =>
        new Promise((resolve, reject) => {
            const path = `./public/ship_LOD${level}.glb`;
            gltfLoader.load(
                path,
                (gltf) => {
                    const model = gltf.scene;
                    model.visible = false;
                    scene.add(model);
                    resolve(model);
                    console.log(`[LOD] Level ${level} loaded from ${path}`);
                },
                (xhr) => {
                    console.log(`[LOD PROGRESS] Level ${level}: ${((xhr.loaded / xhr.total) * 100).toFixed(2)}% loaded`);
                },
                (error) => reject(error)
            );
        });

    // Load multiple LODs and swap them after delay
    const lodLevels = [0, 1, 2];
    const lodModels = await Promise.all(lodLevels.map(loadLODLevel));

    lodModels[0].visible = true;
    console.log("Low poly model (LOD0) visible");

    // Swap LODs every few seconds (simulate progressive loading)
    let currentLOD = 0;
    setInterval(() => {
        lodModels[currentLOD].visible = false;
        currentLOD = (currentLOD + 1) % lodModels.length;
        lodModels[currentLOD].visible = true;
        console.log(`Swapped to LOD level ${currentLOD}`);
    }, 5000);

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

    const endTime = performance.now();
    const totalLoadTime = ((endTime - startTime) / 1000).toFixed(2); // in seconds
    console.timeEnd("Scene Load Time");
    console.log(`⏱️ Total Load Time: ${totalLoadTime} seconds`);

    const infoBox = document.getElementById('info');
    if (infoBox) {
        infoBox.innerHTML += `<br>⏱️ Load Time: <strong>${totalLoadTime}s</strong>`;
    }


    // Hide loading overlay if present
    const loadingElem = document.getElementById('loading');
    if (loadingElem) loadingElem.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', loadTestScene);
export { loadTestScene };
