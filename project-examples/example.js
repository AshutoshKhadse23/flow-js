import FlowJS from '../library/index.js';

async function loadScene() {
    const scene = new FlowJS();
    await scene.loadHDRI('/hdri.hdr');
    await scene.loadModel('/jet.glb');
    scene.setupResize();
    scene.start();
}

loadScene();