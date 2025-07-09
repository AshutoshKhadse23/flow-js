import * as THREE from "three";

export function createRenderer({
  width = window.innerWidth,
  height = window.innerHeight,
  antialias = true,
  toneMapping = THREE.ACESFilmicToneMapping,
  toneMappingExposure = 1.2,
  outputEncoding = THREE.sRGBEncoding,
  appendTo = document.body,
} = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias });
  renderer.setSize(width, height);
  renderer.outputEncoding = outputEncoding;
  renderer.toneMapping = toneMapping;
  renderer.toneMappingExposure = toneMappingExposure;

  appendTo.appendChild(renderer.domElement);
  return renderer;
}
