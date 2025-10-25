#!/usr/bin/env node

import { WebIO } from "@gltf-transform/core";
import { simplify, weld, quantize, cloneDocument } from "@gltf-transform/functions";
import { MeshoptSimplifier } from "meshoptimizer";
import fs from "fs";
import path from "path";

await MeshoptSimplifier.ready;

const DEFAULT_LOD_LEVELS = [
  { ratio: 0.3, error: 0.02 }, // Medium detail
  { ratio: 0.1, error: 0.05 }, // Low detail
];

/**
 * Generate LODs for a given GLB/GLTF file
 * Usage: node generateLOD.js input.glb outputDir/
 */
async function generateLODs(inputPath, outputDir, lodLevels = DEFAULT_LOD_LEVELS) {
  const io = new WebIO();

  const inputBuffer = fs.readFileSync(inputPath);
  const document = await io.readBinary(inputBuffer);

  const baseName = path.basename(inputPath, path.extname(inputPath));

  console.log(`Generating LODs for: ${baseName}`);

  // Write original as LOD0
  const lod0Path = path.join(outputDir, `${baseName}_LOD0.glb`);
  fs.writeFileSync(lod0Path, inputBuffer);
  console.log(`Saved LOD0 → ${lod0Path}`);

  for (let i = 0; i < lodLevels.length; i++) {
    const { ratio, error } = lodLevels[i];
    const clone = await cloneDocument(document);

    console.log(`→ Simplifying to ratio=${ratio}, error=${error}...`);

    await clone.transform(weld(), quantize(), simplify({ simplifier: MeshoptSimplifier, ratio, error }));

    const outBuffer = await io.writeBinary(clone);
    const lodPath = path.join(outputDir, `${baseName}_LOD${i + 1}.glb`);
    fs.writeFileSync(lodPath, outBuffer);
    console.log(`✅ Saved LOD${i + 1} → ${lodPath}`);
  }

  console.log("All LODs generated successfully!");
}


async function main () {
  const [,, input, outputDir] = process.argv;

  if (!input || !outputDir) {
    console.error("Error: Missing required arguments.");
    console.error("\nUsage: npx flow-lod <input.glb> <outputDir>");
    process.exit(1);
  }

  try {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    await generateLODs(input, outputDir);

  } catch (e) {
    console.error(`\nAn error occurred: ${e.message}`);
    process.exit(1);
  }
}

main()