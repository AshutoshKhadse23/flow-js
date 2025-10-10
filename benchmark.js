// benchmark.js
// ES module benchmark script for browser.
// Edit CONFIG below to point to your actual model and library paths.

import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.158.0/examples/jsm/loaders/GLTFLoader.js';

// ---------- CONFIG ----------
// Path to your library ES module that exports loadGLTF()
// e.g. './dist/your-library.js', './src/loader.js' etc.
const IMPORT_PATH_TO_YOUR_LIBRARY = './library/core/loader.js';

// The "highest" LOD file (LOD0). Plain three.js test will load this directly.
// For progressive LOD test pass this same path to loadGLTF; it will derive baseName.
const MODEL_LOD0_PATH = './public/ship_LOD0.glb'; // <-- change to your model path

// LOD levels expected by your library (should match what your loadGLTF expects)
const LOD_LEVELS = [
    { distance: 0 },   // LOD0 (highest detail)
    { distance: 10 },  // LOD1
    { distance: 20 },  // LOD2 (lowest detail)
];

// how many runs to average (3 recommended)
const RUNS = 3;

// timeout for waiting full high-poly loads (ms)
const FULL_LOAD_TIMEOUT = 20000;
// ----------------------------

const logEl = document.getElementById('log') || { textContent: '' };
function log(...args) {
    console.log(...args);
    if (logEl) {
        logEl.textContent += args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ') + '\n';
        logEl.scrollTop = logEl.scrollHeight;
    }
}

// dynamic import of user's library
const userLib = await import(IMPORT_PATH_TO_YOUR_LIBRARY).catch(err => {
    log('[ERROR] Failed to import your library module at', IMPORT_PATH_TO_YOUR_LIBRARY, err);
    throw err;
});
if (!userLib.loadGLTF) {
    log('[ERROR] your library module does not export loadGLTF. Export a function named loadGLTF.');
    throw new Error('loadGLTF not found in your library module');
}
const { loadGLTF } = userLib;

// Create renderer / scene / camera once (reused across tests)
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth * 0.9, window.innerHeight * 0.75);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, renderer.domElement.width / renderer.domElement.height, 0.1, 1000);
camera.position.set(0, 1.5, 4);
const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);
const dir = new THREE.DirectionalLight(0xffffff, 0.6);
dir.position.set(5, 10, 7);
scene.add(dir);

const plainLoader = new GLTFLoader();

// utility to dispose a THREE object and its resources
function disposeObject(obj) {
    obj.traverse(node => {
        if (node.isMesh) {
            if (node.geometry) {
                node.geometry.dispose();
            }
            if (node.material) {
                // material may be an array
                const disposeMaterial = m => {
                    if (!m) return;
                    if (m.map) { m.map.dispose(); }
                    if (m.lightMap) { m.lightMap.dispose(); }
                    if (m.envMap) { m.envMap.dispose(); }
                    if (m.emissiveMap) m.emissiveMap.dispose?.();
                    if (m.normalMap) m.normalMap?.dispose?.();
                    if (m.metalnessMap) m.metalnessMap?.dispose?.();
                    if (m.roughnessMap) m.roughnessMap?.dispose?.();
                    m.dispose();
                };
                if (Array.isArray(node.material)) node.material.forEach(disposeMaterial);
                else disposeMaterial(node.material);
            }
        }
    });
}

// clear scene children (but keep lights/camera if needed)
function clearSceneKeepLights() {
    const toRemove = [];
    scene.children.forEach(child => {
        if (child === ambient || child === dir || child === camera) return;
        toRemove.push(child);
    });
    toRemove.forEach(c => {
        scene.remove(c);
        disposeObject(c);
    });
}

// Render a single frame
function renderOnce() {
    renderer.render(scene, camera);
}

// RUN plain three.js single run -> returns time (ms) to first render after model loaded
async function runPlainOnce(modelPath) {
    clearSceneKeepLights();
    const t0 = performance.now();
    const gltf = await plainLoader.loadAsync(modelPath);
    scene.add(gltf.scene);
    renderOnce();
    const t1 = performance.now();
    const initialMs = t1 - t0;
    // cleanup
    scene.remove(gltf.scene);
    disposeObject(gltf.scene);
    return initialMs;
}

// RUN progressive LOD single run -> returns { initialMs (low-poly visible), fullMs (all high LODs loaded or null) }
async function runProgressiveOnce(modelLOD0Path) {
    clearSceneKeepLights();

    return new Promise((resolve) => {
        const start = performance.now();
        const expectedHighCount = Math.max(LOD_LEVELS.length - 1, 0); // count of LODs that are "higher" than the low one
        let highLoadedCount = 0;
        let initialMs = null;
        let fullMs = null;
        let resolved = false;

        // safety timeout to resolve even if some LOD fails
        const timeoutId = setTimeout(() => {
            if (!resolved) {
                resolved = true;
                log('[WARN] Progressive full-load timeout reached');
                resolve({ initialMs, fullMs });
            }
        }, FULL_LOAD_TIMEOUT);

        loadGLTF(modelLOD0Path, {
            lod: true,
            progressiveLOD: true,
            lodLevels: LOD_LEVELS,
            // when low-poly is ready (your loadGLTF calls onLoad right after adding low poly)
            onLoad: ({ model /*, gltfs */ }) => {
                scene.add(model);
                renderOnce();
                initialMs = performance.now() - start;
                log(`[PROGRESSIVE] low-poly visible in ${initialMs.toFixed(2)} ms`);
                // If there are no higher LODs expected, we can resolve immediately
                if (expectedHighCount === 0 && !resolved) {
                    resolved = true;
                    clearTimeout(timeoutId);
                    fullMs = initialMs;
                    resolve({ initialMs, fullMs });
                }
            },
            // onProgress will be called for each higher LOD that finishes in your loader
            onProgress: ({ level, file, message }) => {
                highLoadedCount++;
                log(`[PROGRESSIVE] ${message} (${file})`);
                // when all higher LODs have loaded:
                if (!resolved && highLoadedCount >= expectedHighCount) {
                    fullMs = performance.now() - start;
                    log(`[PROGRESSIVE] all higher LODs loaded in ${fullMs.toFixed(2)} ms`);
                    resolved = true;
                    clearTimeout(timeoutId);
                    resolve({ initialMs, fullMs });
                }
            }
        });
    });
}

// Run multiple runs and compute averages
async function runFullBenchmark() {
    log('--- Benchmark start ---\n');
    const plainTimes = [];
    const progInitial = [];
    const progFull = [];

    for (let r = 1; r <= RUNS; r++) {
        log(`Run ${r}/${RUNS} — Plain three.js (full model)`);
        const p = await runPlainOnce(MODEL_LOD0_PATH);
        log(`Plain initial (full model) = ${p.toFixed(2)} ms`);
        plainTimes.push(p);

        // little break
        await new Promise(s => setTimeout(s, 250));

        log(`Run ${r}/${RUNS} — Progressive LOD (low-poly first)`);
        const { initialMs, fullMs } = await runProgressiveOnce(MODEL_LOD0_PATH);
        log(`Progressive initial (low-poly visible) = ${initialMs?.toFixed(2) ?? 'N/A'} ms`);
        log(`Progressive full (all high LODs) = ${fullMs?.toFixed(2) ?? 'N/A'} ms`);
        progInitial.push(initialMs ?? Number.POSITIVE_INFINITY);
        progFull.push(fullMs ?? Number.POSITIVE_INFINITY);

        // cleanup tiny pause
        await new Promise(s => setTimeout(s, 300));
    }

    // compute averages
    const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
    const plainAvg = avg(plainTimes);
    const progInitialAvg = avg(progInitial);
    const progFullAvg = avg(progFull);

    log('\n--- Benchmark Summary (averages over ' + RUNS + ' runs) ---');
    log(`Plain three.js initial (full model) average: ${plainAvg.toFixed(2)} ms`);
    log(`Progressive LOD initial (low-poly) average: ${progInitialAvg.toFixed(2)} ms`);
    log(`Progressive LOD full (all high LODs) average: ${progFullAvg.toFixed(2)} ms`);

    const improvement = ((plainAvg - progInitialAvg) / plainAvg) * 100;
    log(`\nPerceived load improvement (initial visible): ${improvement.toFixed(1)}% faster (lower is better).`);
    log('Note: progressive full load may be similar or slightly slower overall, but perceived initial load is improved.\n');
}

runFullBenchmark().catch(err => {
    log('[ERROR] Benchmark failed:', err);
});