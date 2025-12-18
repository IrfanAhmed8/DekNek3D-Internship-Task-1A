import fs from "fs/promises";
import path from "path";
import { NodeIO } from "@gltf-transform/core";
import { EXTMeshGPUInstancing } from "@gltf-transform/extensions";

export async function convertGLBtoPLY(inputPath, outputPath, binary = true) {
  const io = new NodeIO().registerExtensions([EXTMeshGPUInstancing]);
  const document = await io.read(inputPath);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  await io.write(outputPath, document, {
    format: "ply",
    binary
  });
}
