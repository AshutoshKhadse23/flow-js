import { NodeIO } from '@gltf-transform/core';
import { simplify, weld, quantize, cloneDocument } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';

async function generateMultipleLODs(inputPath, baseOutputName) {
    const io = new NodeIO().registerExtensions([]);
    await MeshoptSimplifier.ready;
    const originalDocument = await io.read(inputPath);

    const lodLevels = [
        { name: 'lod1', ratio: 0.3 },
        { name: 'lod2', ratio: 0.1 },
    ];

    for (const level of lodLevels) {
        console.log(`\nGenerating ${level.name} (ratio: ${level.ratio})`);
        const document = await cloneDocument(originalDocument);
        await document.transform(weld(), quantize());
        if (level.ratio < 1.0) {
            try {
                await document.transform(simplify({
                    simplifier: MeshoptSimplifier,
                    ratio: level.ratio,
                    error: 0.02,
                }));
                console.log(`Simplification completed for ${level.name}`);
            } catch (err) {
                console.warn(`Simplification failed for ${level.name}:`, err.message);
                continue;
            }
        } else {
            console.log(`(Skipping simplification for ${level.name} — keeping full detail)`);
        }
        const outputPath = `./${baseOutputName}_${level.name}.glb`;
        io.write(outputPath, document);
        console.log(`Saved: ${outputPath}`);
    }

    console.log('\nAll LOD levels generated successfully.');
}

await generateMultipleLODs('./models/ship.glb', './models/ship');