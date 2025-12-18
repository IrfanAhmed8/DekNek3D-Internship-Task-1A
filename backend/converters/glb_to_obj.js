import fs from "fs/promises";
import path from "path";
//NodeIO is used to read and write 3D model files in various formats

import { NodeIO } from "@gltf-transform/core";
import { EXTMeshGPUInstancing } from "@gltf-transform/extensions";

export async function convertGLBtoOBJ(inputPath, outputDir, baseName) {
  const io = new NodeIO().registerExtensions([EXTMeshGPUInstancing]);
  const document = await io.read(inputPath);

  await fs.mkdir(outputDir, { recursive: true });

  await io.write(path.join(outputDir, `${baseName}.obj`), document, {
    format: "obj"
  });
}
