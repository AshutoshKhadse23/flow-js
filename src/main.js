import { createThreeScene } from "./utils/createRenderer.js";

// Your original code simplified to just this:
async function initScene() {
  try {
    const { animationLoop } = await createThreeScene({
      hdri: {
        url: "/hdri.hdr",
      },
      model: {
        url: "/jet.glb",
        scale: [0.5, 0.5, 0.5],
        useCameraFromFile: true,
      },
      controls: {
        target: [0, 1, 0],
      },
      onLoad: (sceneData) => {
        console.log("Scene loaded successfully!", sceneData);
      },
      onError: (error) => {
        console.error("Failed to load scene:", error);
      },
    });

    // Start the animation loop
    animationLoop.start();

  } catch (error) {
    console.error("Scene creation failed:", error);
  }
}

// Initialize the scene
initScene();

